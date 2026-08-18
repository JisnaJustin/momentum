from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    UserProfileView,
    HabitViewSet,
    HabitLogViewSet,
    DashboardView,
    WeeklyTrackerView
)

router = DefaultRouter()
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
