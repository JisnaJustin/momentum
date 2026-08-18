from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Habit, HabitLog
from .services import calculate_habit_streaks


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allows authentication with either username OR email address.
    """
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        if username_or_email and '@' in username_or_email:
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            if user_obj:
                attrs['username'] = user_obj.username
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm']
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class HabitLogSerializer(serializers.ModelSerializer):
    is_completed = serializers.BooleanField(read_only=True)
    habit_name = serializers.CharField(source='habit.name', read_only=True)

    class Meta:
        model = HabitLog
        fields = [
            'id',
            'habit',
            'habit_name',
            'date',
            'is_done',
            'value',
            'is_completed',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_completed', 'habit_name']

    def validate_habit(self, habit):
        request = self.context.get('request')
        if request and habit.owner != request.user:
            raise serializers.ValidationError("You do not have permission to log for this habit.")
        return habit

    def validate_value(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Value must be non-negative.")
        return value


class HabitSerializer(serializers.ModelSerializer):
    is_measurable = serializers.BooleanField(read_only=True)
    current_streak = serializers.SerializerMethodField()
    longest_streak = serializers.SerializerMethodField()
    completion_rate_30d = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            'id',
            'name',
            'description',
            'category',
            'icon',
            'frequency',
            'selected_days',
            'target',
            'unit',
            'start_date',
            'is_active',
            'is_measurable',
            'current_streak',
            'longest_streak',
            'completion_rate_30d',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
            'is_measurable',
            'current_streak',
            'longest_streak',
            'completion_rate_30d'
        ]

    def get_current_streak(self, obj):
        stats = calculate_habit_streaks(obj)
        return stats['current_streak']

    def get_longest_streak(self, obj):
        stats = calculate_habit_streaks(obj)
        return stats['longest_streak']

    def get_completion_rate_30d(self, obj):
        stats = calculate_habit_streaks(obj)
        return stats['completion_rate_30d']

    def validate_target(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Target must be a positive number.")
        return value

    def validate_selected_days(self, value):
        if value:
            if not isinstance(value, list):
                raise serializers.ValidationError("selected_days must be a list of weekday numbers (0=Mon, 6=Sun).")
            for day in value:
                try:
                    day_int = int(day)
                    if day_int < 0 or day_int > 6:
                        raise ValueError()
                except (ValueError, TypeError):
                    raise serializers.ValidationError(f"Invalid weekday '{day}'. Must be between 0 (Mon) and 6 (Sun).")
        return value

    def validate(self, attrs):
        frequency = attrs.get('frequency', getattr(self.instance, 'frequency', 'daily'))
        selected_days = attrs.get('selected_days', getattr(self.instance, 'selected_days', []))
        
        if frequency == 'selected_days' and not selected_days:
            raise serializers.ValidationError({
                "selected_days": "Please select at least one weekday for this frequency."
            })
            
        target = attrs.get('target', getattr(self.instance, 'target', None))
        unit = attrs.get('unit', getattr(self.instance, 'unit', ''))
        if target and not unit.strip():
            attrs['unit'] = 'units'

        return attrs


class HabitDetailSerializer(HabitSerializer):
    stats = serializers.SerializerMethodField()
    recent_logs = serializers.SerializerMethodField()

    class Meta(HabitSerializer.Meta):
        fields = HabitSerializer.Meta.fields + ['stats', 'recent_logs']

    def get_stats(self, obj):
        return calculate_habit_streaks(obj)

    def get_recent_logs(self, obj):
        logs = obj.logs.all().order_by('-date')[:30]
        return HabitLogSerializer(logs, many=True).data
