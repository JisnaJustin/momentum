"""
URL configuration for momentum_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from habits.views import CustomTokenObtainPairView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Authentication Endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Habits and App Endpoints
    path('api/', include('habits.urls')),
]
