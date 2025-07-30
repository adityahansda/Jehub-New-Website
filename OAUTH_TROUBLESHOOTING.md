# 🔧 OAuth Troubleshooting Checklist

Since you're getting redirected to the failure page, let's systematically check each part of the OAuth setup.

## ✅ **Step-by-Step Verification:**

### 1. **Google Cloud Console Setup**
- [ ] **Client ID**: `1055017533862-fja78lll7llc3mfo2iv3gc7sgn23eiv0.apps.googleusercontent.com` ✅
- [ ] **Client Secret**: Get the ACTUAL secret (not the same as Client ID) ❗
- [ ] **Authorized redirect URIs** includes:
  ```
  https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11
  ```
- [ ] **OAuth consent screen** is configured
- [ ] **APIs enabled**: Google+ API and People API

### 2. **Appwrite Console Setup**
- [ ] Go to your Appwrite Console → Project → **Auth** → **Settings**
- [ ] Find **Google** in OAuth2 Providers
- [ ] Configure with:
  - **Client ID**: `1055017533862-fja78lll7llc3mfo2iv3gc7sgn23eiv0.apps.googleusercontent.com`
  - **Client Secret**: [Your REAL client secret from Google]
  - **Success URL**: `http://localhost:3000/auth/oauth-success`
  - **Failure URL**: `http://localhost:3000/auth/oauth-failure`
- [ ] **Save** the configuration
- [ ] Ensure the Google provider is **ENABLED** (toggle switch)

### 3. **Common Issues & Solutions**

#### Issue: "Invalid Client Secret"
**Solution**: Get the correct Client Secret from Google Cloud Console
1. Go to your OAuth 2.0 Client ID
2. Look for "Client Secret" field
3. If you can't see it, click "Show" or regenerate it
4. Copy the actual secret (usually starts with `GOCSPX-`)

#### Issue: "OAuth Provider Not Configured"
**Solution**: Verify Appwrite OAuth provider is enabled
1. In Appwrite Console, check that Google OAuth toggle is ON
2. Verify Client ID and Secret are saved correctly
3. Make sure Success/Failure URLs don't have typos

#### Issue: "redirect_uri_mismatch"
**Solution**: Exact URI match required
- Google Console URI: `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11`
- Must be EXACTLY this (no trailing slashes, exact protocol)

## 🧪 **Testing Tools I've Created:**

### 1. **OAuth Diagnostic Page**
Visit: `http://localhost:3000/test/oauth-test`

This page will help you:
- Check your current authentication status
- Test Appwrite connection
- View detailed logs of OAuth attempts
- Debug authentication flow

### 2. **Enhanced OAuth Success Page**
The success page now shows debug information in development mode to help identify issues.

### 3. **Configuration Verification Script**
Run: `node verify-oauth-config.js`

## 🔍 **Manual Verification Steps:**

### Check Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Find your OAuth 2.0 Client ID
4. Verify redirect URI is EXACTLY: `https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/686d35da003a55dfcc11`

### Check Appwrite Console:
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Your Project → Auth → Settings
3. OAuth2 Providers → Google
4. Verify:
   - Client ID matches Google Console
   - Client Secret is the REAL secret (not Client ID)
   - URLs are correct
   - Provider is ENABLED

## 🚨 **Most Likely Issues:**

1. **Wrong Client Secret**: You provided the Client ID as the secret
2. **Provider Not Enabled**: Google OAuth toggle is OFF in Appwrite
3. **Incorrect Redirect URI**: Minor typo in the redirect URI
4. **OAuth Consent Screen**: Not properly configured in Google Console

## 🛠 **Next Steps:**

1. **Use the diagnostic page**: Visit `/test/oauth-test` to see detailed logs
2. **Verify Client Secret**: Get the REAL client secret from Google Console
3. **Check Appwrite provider**: Ensure it's enabled and configured correctly
4. **Test step by step**: Use the diagnostic tools to identify the exact issue

## 📞 **If Still Having Issues:**

1. Check browser Developer Tools → Network tab during OAuth flow
2. Look for any 400/401/403 errors
3. Check Appwrite logs in the console
4. Verify your Google Cloud project has the APIs enabled

The diagnostic page at `/test/oauth-test` will give you the most detailed information about what's going wrong!
