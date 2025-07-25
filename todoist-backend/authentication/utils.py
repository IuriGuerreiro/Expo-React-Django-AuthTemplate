import os
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import EmailVerificationToken


def send_verification_email(user, request):
    """Send email verification email to user (prints to console for development)"""
    # Create verification token
    token = EmailVerificationToken.objects.create(user=user)
    
    # Build verification URL
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    verification_url = f"{frontend_url}/verify-email/{token.token}"
    
    # Print verification details to console
    print("\n" + "="*80)
    print("🔐 EMAIL VERIFICATION CODE")
    print("="*80)
    print(f"📧 User: {user.email}")
    print(f"👤 Name: {user.first_name or user.username}")
    print(f"🔗 Verification URL: {verification_url}")
    print(f"🎫 Token: {token.token}")
    print(f"⏰ Expires: {token.expires_at}")
    print("="*80)
    print("📱 To verify: Copy the URL above and paste it in your browser")
    print("="*80 + "\n")
    
    # For development, we always return True since we're printing to console
    return True


def verify_email_token(token_str):
    """Verify email token and activate user"""
    try:
        token = EmailVerificationToken.objects.get(token=token_str, is_used=False)
        
        if token.is_expired():
            return False, "Token has expired"
        
        # Mark token as used
        token.is_used = True
        token.save()
        
        # Activate user
        user = token.user
        user.is_email_verified = True
        user.is_active = True
        user.save()
        
        return True, "Email verified successfully"
        
    except EmailVerificationToken.DoesNotExist:
        return False, "Invalid or expired token"