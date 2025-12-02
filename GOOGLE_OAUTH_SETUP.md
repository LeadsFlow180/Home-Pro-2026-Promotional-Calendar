# Google OAuth Setup Instructions

To enable Google authentication, you need to set up a Google OAuth application:

## 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (for user profile information)

## 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add these authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (for development)
   - https://your-domain.com/api/auth/callback/google (for production)

## 3. Update Environment Variables
Replace the placeholder values in your `.env.local` file:

```
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
NEXTAUTH_SECRET=your-secure-random-string-here
```

## 4. Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Note
The app will work but authentication will fail until you add real Google OAuth credentials.