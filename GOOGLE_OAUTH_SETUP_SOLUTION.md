# Google OAuth Setup Solution for To-Doist

## Issue Analysis
You're getting "Error 400: unsupported response type with flowName=GeneralOAuthFlow" because:

1. **Client ID Mismatch**: Using YummiAI's Client IDs which are configured for `com.yummiai.app`, not `com.rshazow.todoist`
2. **SHA1 Certificate**: Your SHA1 `79:07:87:C4:63:FD:B3:87:11:84:E8:76:A1:C7:D7:5A:D8:C6:B5:95` needs to be registered
3. **Redirect URI**: The Client IDs are not configured for your redirect URI scheme

## Quick Fix Solutions

### Option 1: Create Your Own Google OAuth Configuration (Recommended)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project for To-Doist
3. **Enable Google+ API**: APIs & Services → Library → Google+ API → Enable
4. **Create OAuth Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → OAuth 2.0 Client IDs
   
5. **Configure Android Client**:
   - Application type: Android
   - Package name: in app.Json
   - SHA-1: run eas credentials
   
6. **Configure Web Client**:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `https://auth.expo.io/@your-expo-username/To-Doist-Expo`
     - `com.rshazow.todoist://`

7. **Update Environment Variables**:
   ```typescript
   // config/env.ts
   GOOGLE_WEB_CLIENT_ID: 'YOUR_NEW_WEB_CLIENT_ID.apps.googleusercontent.com',
   GOOGLE_ANDROID_CLIENT_ID: 'YOUR_NEW_ANDROID_CLIENT_ID.apps.googleusercontent.com',
   ```

### Option 2: Temporary Fix with YummiAI Scheme (Quick Test)

Change your app scheme to match YummiAI temporarily:

```json
// app.json
{
  "expo": {
    "scheme": "com.yummiai.app",
    "ios": {
      "bundleIdentifier": "com.yummiai.app"
    },
    "android": {
      "package": "com.yummiai.app"
    }
  }
}
```

## Code Changes Made

### 1. Fixed App.tsx
✅ Added `WebBrowser.maybeCompleteAuthSession()` 
✅ Added missing WebBrowser import

### 2. Fixed GoogleOAuth.tsx 
✅ Added `expoClientId` configuration
✅ Removed problematic `responseType: 'token'`
✅ Using YummiAI's exact working configuration

### 3. Updated Backend
✅ Simplified to accept Google user data directly
✅ Removed dependency on Google Auth libraries

## Current Configuration Status

**Package**: `com.rshazow.todoist`
**SHA1**: `79:07:87:C4:63:FD:B3:87:11:84:E8:76:A1:C7:D7:5A:D8:C6:B5:95`
**Scheme**: `com.rshazow.todoist`

**Problem**: YummiAI Client IDs are not configured for your package/certificate.

## Next Steps

1. **Create your own Google OAuth Client IDs** (Option 1) - This is the proper long-term solution
2. **OR temporarily use YummiAI scheme** (Option 2) - For quick testing
3. **Test the OAuth flow**
4. **Verify authentication works end-to-end**

The authentication flow should work perfectly once you have properly configured Client IDs for your package name and certificate.