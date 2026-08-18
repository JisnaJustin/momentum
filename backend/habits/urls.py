from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from .views import (
    RegisterView,
    UserProfileView,
    HabitViewSet,
    HabitLogViewSet,
    DashboardView,
    WeeklyTrackerView
)


class PublicRootRouter(DefaultRouter):
    """
    Default router that allows unauthenticated access to the API root index.
    Individual ViewSets and views enforce their own authentication and permissions.
    """
    def get_api_root_view(self, api_urls=None):
        view = super().get_api_root_view(api_urls=api_urls)
        view.cls.permission_classes = [AllowAny]
        return view


router = PublicRootRouter()
router.register(r'habits', HabitViewSet, basename='habit')
router.register(r'habit-logs', HabitLogViewSet, basename='habit-log')

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', UserProfileView.as_view(), name='user-profile'),

    # Dashboard & Weekly Tracker aggregations
    path('dashboard/today/', DashboardView.as_view(), name='dashboard-today'),
    path('tracker/weekly/', WeeklyTrackerView.as_view(), name='weekly-tracker'),

    # ViewSet CRUD endpoints (/api/habits/, /api/habit-logs/)
    path('', include(router.urls)),
]
