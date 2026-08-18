from datetime import datetime, date
from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Habit, HabitLog
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    HabitSerializer,
    HabitDetailSerializer,
    HabitLogSerializer,
    CustomTokenObtainPairSerializer
)
from .services import (
    calculate_habit_streaks,
    get_dashboard_summary,
    get_weekly_tracker_matrix
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Login endpoint that supports logging in with username OR email.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    Public endpoint for registering a new user account.
    Returns JWT tokens and user details on success.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant login upon registration
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully.'
        }, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    """
    Returns the profile information of the currently authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class HabitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing habits.
    All operations are strictly scoped to the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HabitDetailSerializer
        return HabitSerializer

    def get_queryset(self):
        # Enforce strict user data isolation
        queryset = Habit.objects.filter(owner=self.request.user)
        
        # Optional filters
        category = self.request.query_params.get('category')
        is_active = self.request.query_params.get('is_active')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category=category)
        if is_active is not None:
            if is_active.lower() in ('true', '1'):
                queryset = queryset.filter(is_active=True)
            elif is_active.lower() in ('false', '0'):
                queryset = queryset.filter(is_active=False)
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return queryset

    def perform_create(self, serializer):
        # Automatically assign authenticated user as owner
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Returns deep streak and completion statistics for a habit."""
        habit = self.get_object()
        stats = calculate_habit_streaks(habit)
        return Response(stats)

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        """Toggles the active state of a habit."""
        habit = self.get_object()
        habit.is_active = not habit.is_active
        habit.save(update_fields=['is_active', 'updated_at'])
        return Response({
            'id': habit.id,
            'is_active': habit.is_active,
            'message': f"Habit '{habit.name}' is now {'active' if habit.is_active else 'inactive'}."
        })


class HabitLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing habit logs.
    All operations are strictly scoped to habits owned by the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HabitLogSerializer

    def get_queryset(self):
        # Enforce strict isolation through habit ownership
        queryset = HabitLog.objects.filter(habit__owner=self.request.user)
        
        habit_id = self.request.query_params.get('habit')
        date_param = self.request.query_params.get('date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if habit_id:
            queryset = queryset.filter(habit_id=habit_id)
        if date_param:
            queryset = queryset.filter(date=date_param)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset

    def create(self, request, *args, **kwargs):
        """
        Creates or updates a habit log for a given date (upsert pattern).
        Verifies habit ownership before saving.
        """
        habit_id = request.data.get('habit')
        date_str = request.data.get('date')
        is_done = request.data.get('is_done', False)
        value = request.data.get('value', None)

        if not habit_id:
            return Response({'habit': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if not date_str:
            return Response({'date': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce habit ownership
        habit = get_object_or_404(Habit, id=habit_id, owner=request.user)

        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'date': ['Date has wrong format. Use YYYY-MM-DD.']}, status=status.HTTP_400_BAD_REQUEST)

        # Clean value
        if value is not None and value != '':
            try:
                value = float(value)
                if value < 0:
                    return Response({'value': ['Value must be non-negative.']}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({'value': ['A valid number is required.']}, status=status.HTTP_400_BAD_REQUEST)
        else:
            value = None

        log, created = HabitLog.objects.update_or_create(
            habit=habit,
            date=parsed_date,
            defaults={
                'is_done': bool(is_done),
                'value': value
            }
        )

        serializer = self.get_serializer(log)
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=response_status)


class DashboardView(APIView):
    """
    Returns today's habits, completion progress, and summary statistics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                as_of_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            as_of_date = timezone.localdate()

        data = get_dashboard_summary(request.user, as_of_date)
        return Response(data)


class WeeklyTrackerView(APIView):
    """
    Returns 7-day tracking matrix (Monday to Sunday) for active habits.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        start_date_str = request.query_params.get('start_date')
        if start_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'Invalid start_date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            today = timezone.localdate()
            start_date = today - timedelta(days=today.weekday())

        data = get_weekly_tracker_matrix(request.user, start_date)
        return Response(data)
