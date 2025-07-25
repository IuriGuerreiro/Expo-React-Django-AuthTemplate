# Google OAuth Setup for Expo App

## Prerequisites

1. **Google Cloud Console Project**: You need a Google Cloud Console project with OAuth 2.0 credentials.
2. **Same Web Client ID**: Use the same Web Client ID from your React app for consistency.

## Setup Steps

### 1. Configure Environment Variables

Copy the example environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Web Client ID:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### 2. Update Google Cloud Console

In Google Cloud Console > APIs & Services > Credentials:

1. Find your existing OAuth 2.0 Client ID (Web application)
2. Add these **Authorized JavaScript origins**:
   - `http://localhost:8080` (Expo dev server)
   - `http://localhost:8081` (Expo dev server alternate)
   - `http://192.168.3.2:8080` (Local network IP if using)
   - Your production domains

### 3. For Production (if building APK/IPA)

If you plan to build production apps, you'll need:

#### Android:
1. Create an Android OAuth Client ID in Google Cloud Console
2. Add the SHA-1 fingerprint of your Android app
3. Update `ANDROID_CLIENT_ID` in `config/google.ts`

#### iOS:
1. Create an iOS OAuth Client ID in Google Cloud Console  
2. Add your iOS Bundle ID
3. Update `IOS_CLIENT_ID` in `config/google.ts`

## How It Works

1. **Web-based OAuth**: Uses the same web OAuth flow as your React app
2. **ID Token**: Gets Google ID token and sends it to your Django backend
3. **Backend Verification**: Django verifies the token and creates/logs in the user
4. **JWT Response**: Returns JWT tokens for app authentication

## Testing

1. Start your Django backend: `python manage.py runserver 192.168.3.2:8000`
2. Start Expo dev server: `npx expo start`
3. Open the app and try Google Sign-In
4. Check console logs for debugging information

## Troubleshooting

- **"Google Sign-In not configured"**: Add your Client ID to `config/google.ts`
- **"Invalid Client ID"**: Check that your origins are added in Google Cloud Console
- **"Play Services not available"**: Only works on Android devices/emulators with Google Play Services
- **Network errors**: Ensure your backend is running and accessible

## Security Notes

- Never commit your actual Client ID to public repositories
- Use environment variables in production
- The Web Client ID is safe to expose in mobile apps (it's designed for public clients)