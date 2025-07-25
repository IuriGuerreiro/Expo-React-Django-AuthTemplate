# Todoist Clone - Full Stack Application

A modern todo application built with Django REST Framework and React with TypeScript.

## 🚀 Features

- **User Authentication**: Registration, login, JWT tokens
- **Email Verification**: Secure email confirmation system
- **Modern UI**: Beautiful React frontend with responsive design
- **SQLite Database**: Simple setup with room to scale
- **CORS Configured**: Ready for frontend/backend separation

## 📁 Project Structure

```
To-Doist/
├── todoist-backend/          # Django REST API
│   ├── authentication/       # User auth & email verification
│   ├── todos/                # Todo models & views (future)
│   ├── .env.example         # Environment variables template
│   └── EMAIL_SETUP.md       # Email configuration guide
└── todoist-react/           # React TypeScript frontend
    ├── src/
    │   ├── components/      # UI components
    │   ├── contexts/        # React contexts (auth)
    │   └── config/          # API configuration
    └── ...
```

## 🛠️ Quick Start

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd todoist-backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt
   pip install django-cors-headers pillow python-dotenv
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Start development server**:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd todoist-react
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📧 Email Configuration

For email verification to work properly, you need to configure email settings. See [EMAIL_SETUP.md](./todoist-backend/EMAIL_SETUP.md) for detailed instructions on setting up Gmail or other email providers.

### Quick Gmail Setup:
1. Enable 2FA on your Google account
2. Generate an App Password
3. Update your `.env` file:
   ```env
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-16-char-app-password
   ```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/verify-email/` - Email verification
- `POST /api/auth/resend-verification/` - Resend verification email
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/token/refresh/` - Refresh JWT token

## 🎨 Frontend Features

- **Beautiful UI**: Gradient design with animations
- **Responsive**: Works on desktop and mobile
- **Authentication Flow**: Login, register, email verification
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 🧪 Testing

### Test Email Verification
1. Start both servers (Django + React)
2. Go to `http://localhost:5173`
3. Register a new account
4. Check console (development) or email (production) for verification link
5. Click verification link to activate account

### Test Authentication
1. Try logging in before email verification (should be blocked)
2. Verify email, then login (should work)
3. Access protected dashboard

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Development (emails to console)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Production (actual emails)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🚀 Deployment

### Backend (Django)
- Use environment variables for production settings
- Configure proper SMTP email service
- Set `DEBUG=False` in production
- Use PostgreSQL or MySQL for production database

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update CORS settings in Django for production domain

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Email Verification**: Prevents fake accounts
- **CORS Protection**: Configured for specific origins
- **Password Validation**: Django's built-in validators
- **Token Expiration**: Automatic token refresh

## 📝 Next Steps

- [ ] Add todo CRUD functionality
- [ ] Implement user profiles
- [ ] Add categories/tags for todos
- [ ] Email templates with HTML
- [ ] Password reset functionality
- [ ] Social authentication (Google, GitHub)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding!** 🎉