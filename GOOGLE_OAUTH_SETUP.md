# Google OAuth 2.0 Setup Guide

This guide will help you set up Google OAuth 2.0 authentication for your Todoist application.

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Enter project name: `Todoist Auth`
4. Click **"Create"**

### 2. Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for testing)
3. Fill in required fields:
   - **App name**: `Todoist`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. **Scopes**: Click **"Save and Continue"** (no additional scopes needed)
6. **Test users**: Add your email address for testing
7. Click **"Save and Continue"**

### 4. Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. **Name**: `Todoist Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://127.0.0.1:5173
   http://127.0.0.1:5174
   ```
6. **Authorized redirect URIs**: (Leave empty for now)
7. Click **"Create"**
8. **Copy your Client ID** (looks like: `123456-abcdef.apps.googleusercontent.com`)

## ⚙️ Configuration

### Backend (.env)
```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🧪 Testing

### 1. Start Backend
```bash
cd todoist-backend
source venv/bin/activate
python manage.py runserver
```

### 2. Start Frontend
```bash
cd todoist-react
npm run dev
```

### 3. Test OAuth Flow
1. Go to `http://localhost:5173`
2. Click **"Sign in with Google"**
3. Choose your Google account
4. You should be redirected and logged in automatically

## 🔍 Verification Code Flow

Since we're using console-based email verification, here's what happens:

1. **Regular Registration**: 
   - User registers → Verification code printed to Django console
   - User must verify email before login

2. **Google OAuth**:
   - User signs in with Google → Automatically verified and logged in
   - No email verification needed (Google accounts are pre-verified)

## 🚨 Troubleshooting

### "Client ID not configured" Error
- Make sure `VITE_GOOGLE_CLIENT_ID` is set in your `.env` file
- Restart the Vite dev server after adding environment variables

### "Invalid client" Error
- Check that your domain is added to **Authorized JavaScript origins**
- Make sure you're using the correct Client ID

### "Access blocked" Error
- Ensure your email is added to **Test users** in OAuth consent screen
- If you get "unverified app" warning, click **"Advanced"** → **"Go to Todoist (unsafe)"**

### Django Backend Errors
- Check that `GOOGLE_OAUTH_CLIENT_ID` matches your frontend `VITE_GOOGLE_CLIENT_ID`
- Ensure Google auth libraries are installed: `pip install google-auth google-auth-oauthlib`

## 📋 Environment Files

### Backend: `todoist-backend/.env`
```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=123456-abcdef.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-secret

# Email (Console mode for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Frontend: `todoist-react/.env`
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456-abcdef.apps.googleusercontent.com
```

## 🌐 Production Considerations

### Domain Configuration
For production, update **Authorized JavaScript origins**:
```
https://yourdomain.com
https://www.yourdomain.com
```

### Security
- Never commit `.env` files to version control
- Use different Client IDs for development and production
- Enable **"Verified app"** status for production

### Publishing OAuth App
1. Complete OAuth consent screen verification
2. Submit for Google verification (required for 100+ users)
3. Add privacy policy and terms of service URLs

## 📊 User Flow Comparison

| Method | Email Verification | Account Creation | Login Speed |
|--------|-------------------|------------------|-------------|
| **Regular** | Required (console code) | Manual form | Slower |
| **Google OAuth** | Pre-verified | Automatic | Instant |

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/oauth2/web/guides/overview)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)

---

**Ready to test!** 🎉 Your users can now sign in with Google or use traditional email registration.