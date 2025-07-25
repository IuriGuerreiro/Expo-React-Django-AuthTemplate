from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('token/refresh/', views.token_refresh, name='token_refresh'),
    path('profile/', views.profile, name='profile'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('resend-verification/', views.resend_verification_email, name='resend_verification'),
    path('google-oauth/', views.google_oauth, name='google_oauth'),
]