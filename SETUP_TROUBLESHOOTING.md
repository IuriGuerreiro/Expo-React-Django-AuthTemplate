# Setup Troubleshooting Guide

## 🚨 Current Issues & Solutions

### Issue 1: Django Import Error
**Error**: `ModuleNotFoundError: No module named 'google.auth'`

**Solution**: Install Google auth dependencies in your Windows Python environment:

```bash
# In your Windows terminal
cd todoist-backend
python -m pip install -r requirements.txt
```

Or install individually:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### Issue 2: Google OAuth Button Not Showing
**Error**: Shows fallback message instead of Google button

**Solutions**:

1. **Restart Vite Dev Server**:
   ```bash
   # In todoist-react directory
   npm run dev
   ```

2. **Check Environment Variables**:
   - Make sure `.env` file exists in `todoist-react/`
   - Verify it contains: `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
   - Restart the dev server after adding .env variables

3. **Browser Console Check**:
   - Open browser dev tools (F12)
   - Check console for environment variable values
   - Should see your client ID being logged

## 🔧 Complete Setup Steps

### Backend Setup (Windows)
```bash
cd todoist-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd todoist-react
npm install
# Make sure .env file exists with VITE_GOOGLE_CLIENT_ID
npm run dev
```

### Create .env Files

**Backend** (`todoist-backend/.env`):
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Frontend** (`todoist-react/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 🧪 Testing Steps

1. **Start both servers**:
   - Backend: `python manage.py runserver`
   - Frontend: `npm run dev`

2. **Test regular registration**:
   - Go to http://localhost:5173
   - Register new account
   - Check Django console for verification code
   - Copy verification URL and paste in browser

3. **Test Google OAuth** (if configured):
   - Should see Google button on login/register pages
   - If not, check browser console for errors

## 🐛 Common Issues

### Python Version Mismatch
- The error shows Python 3.9 on Windows
- Make sure you're using the same Python version in your virtual environment

### Virtual Environment Issues
```bash
# Delete and recreate virtual environment
rm -rf venv  # or rmdir /s venv on Windows
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Environment Variables Not Loading
```bash
# Restart Vite after adding .env variables
npm run dev
```

### Google Script Not Loading
- Check internet connection
- Verify the Google script tag in `index.html`
- Check browser console for script loading errors

## 📝 Quick Test Commands

**Test Django without Google OAuth**:
```bash
python manage.py shell -c "print('Django working!')"
```

**Test registration endpoint**:
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123","password_confirm":"test123"}'
```

**Check environment variables in React**:
- Open browser console
- Look for the logged environment variables
- Should show your Google Client ID

## 🎯 Expected Behavior

✅ **Working System**:
- Django server starts without errors
- React app shows login/register forms
- Email verification codes print to Django console
- Google OAuth button appears (if client ID configured)
- Registration creates accounts successfully

❌ **Not Working**:
- Import errors on Django startup
- Google OAuth shows fallback message
- Environment variables are undefined

---

**Need more help?** Check the browser console and Django terminal for specific error messages.