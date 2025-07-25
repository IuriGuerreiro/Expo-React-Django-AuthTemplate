from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import CustomUser, EmailVerificationToken
from .serializers import UserRegistrationSerializer, UserSerializer
from .utils import send_verification_email, verify_email_token
from .google_auth import GoogleAuth


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send verification email
            email_sent = send_verification_email(user, request)
            
            if email_sent:
                return Response({
                    'message': 'Registration successful! Please check your email to verify your account.',
                    'email': user.email,
                    'email_sent': True
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'message': 'Registration successful but failed to send verification email. Please contact support.',
                    'email': user.email,
                    'email_sent': False
                }, status=status.HTTP_201_CREATED)
        else:
            # Format errors for better frontend handling
            errors = {}
            for field, field_errors in serializer.errors.items():
                if field == 'non_field_errors':
                    errors['general'] = field_errors[0] if field_errors else 'Validation error occurred'
                else:
                    errors[field] = field_errors[0] if field_errors else 'Invalid value'
            
            return Response({
                'error': 'Registration failed',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Service may be unavailable. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        if email and password:
            # Check if user exists first
            try:
                user_exists = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({'error': 'No account found with this email address.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            user = authenticate(username=email, password=password)
            if user:
                if not user.is_email_verified:
                    return Response({
                        'error': 'Please verify your email address before logging in.',
                        'email_verified': False
                    }, status=status.HTTP_403_FORBIDDEN)
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            else:
                return Response({'error': 'Incorrect password. Please try again.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Service may be unavailable. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    refresh_token = request.data.get('refresh')
    if refresh_token:
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
            })
        except Exception:
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    token = request.data.get('token')
    
    if not token:
        return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    success, message = verify_email_token(token)
    
    if success:
        return Response({'message': message}, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_email(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email)
        
        if user.is_email_verified:
            return Response({'error': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Invalidate old tokens
        EmailVerificationToken.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Send new verification email
        email_sent = send_verification_email(user, request)
        
        if email_sent:
            return Response({'message': 'Verification email sent successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send verification email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except CustomUser.DoesNotExist:
        return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth(request):
    """
    Authenticate user with Google OAuth token
    """
    try:
        print("\n🔍 GOOGLE OAUTH DEBUG:")
        print(f"Request method: {request.method}")
        print(f"Request data keys: {list(request.data.keys()) if request.data else 'No data'}")
        
        token = request.data.get('token')
        print(f"Token received: {'Yes' if token else 'No'}")
        print(f"Token length: {len(token) if token else 'N/A'}")
        if token:
            print(f"Token preview: {token[:50]}...")
        
        if not token:
            print("❌ No token provided")
            return Response({'error': 'Google token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        print("🔍 Calling GoogleAuth.verify_google_token...")
        # Verify Google token
        google_user_info, error = GoogleAuth.verify_google_token(token)
        print(f"Verification result - Error: {error}")
        print(f"Verification result - User info: {google_user_info if not error else 'None'}")
        
        if error:
            print(f"❌ Token verification failed: {error}")
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        
        print("🔍 Calling GoogleAuth.get_or_create_user...")
        # Get or create user
        user, error = GoogleAuth.get_or_create_user(google_user_info)
        print(f"User creation result - Error: {error}")
        print(f"User creation result - User: {user.email if user and not error else 'None'}")
        
        if error:
            print(f"❌ User creation failed: {error}")
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        
        print("🔍 Generating JWT tokens...")
        # Generate JWT tokens
        tokens = GoogleAuth.generate_tokens(user)
        print("✅ JWT tokens generated successfully")
        
        print("✅ Google OAuth successful - returning response")
        return Response({
            'user': UserSerializer(user).data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'Google authentication successful'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Google OAuth exception: {str(e)}")
        return Response({
            'error': 'Service may be unavailable. Please try again later.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
