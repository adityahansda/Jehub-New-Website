# Maintenance Mode Testing Guide

## How to Enable Maintenance Mode

1. **Create a `.env.local` file** (if it doesn't exist) in your project root
2. **Add one of these environment variables**:
   ```
   NEXT_PUBLIC_MAINTENANCE_MODE=true
   ```
   OR
   ```
   NEXT_PUBLIC_COMING_SOON_MODE=true
   ```

## What Happens When Enabled

- ✅ **Home page (/)** - Shows the Coming Soon page with wishlist functionality
- ✅ **Beta Wishlist (/beta-wishlist)** - Accessible for user registration
- ✅ **Wishlist Users (/wishlist-users)** - Accessible to view registered users
- ✅ **Auth routes (/auth/*)** - Accessible for authentication
- ✅ **API routes (/api/*)** - All API endpoints remain functional
- ✅ **Static files** - Images, CSS, JS files load normally
- 🚫 **All other pages** - Redirect to home page (Coming Soon)

## Test Steps

1. **Enable maintenance mode**:
   - Add `NEXT_PUBLIC_MAINTENANCE_MODE=true` to your `.env.local`
   - Restart your dev server: `npm run dev`

2. **Test allowed pages**:
   - Visit `/` - Should show Coming Soon page
   - Visit `/beta-wishlist` - Should work normally
   - Visit `/wishlist-users` - Should work normally

3. **Test restricted pages**:
   - Visit `/dashboard` - Should redirect to `/`
   - Visit `/settings` - Should redirect to `/`
   - Visit `/admin` - Should redirect to `/`

4. **Disable maintenance mode**:
   - Change to `NEXT_PUBLIC_MAINTENANCE_MODE=false` or remove the line
   - Restart your dev server
   - All pages should work normally again

## Features Added

### Coming Soon Page Enhancements
- ✨ **Wishlist CTA** - Clear call-to-action to join the wishlist
- 🔗 **Direct Link** - Routes users to `/beta-wishlist` for registration
- 📧 **Email Subscription** - Existing functionality preserved
- 🎨 **Enhanced UI** - Added divider and improved layout

### Middleware Updates  
- 🛡️ **Smart Routing** - Only blocks non-essential pages
- 🔄 **Flexible Control** - Works with both environment variables
- 📱 **API Preservation** - All APIs remain functional
- 🎯 **Wishlist Access** - Users can still register for beta access

## Environment Variables

```env
# Enable maintenance mode (choose one)
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_COMING_SOON_MODE=true

# Disable maintenance mode
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_COMING_SOON_MODE=false
```

## Production Deployment

When deploying to production with maintenance mode:

1. **Vercel**: Set environment variables in your Vercel dashboard
2. **Other platforms**: Set the environment variable in your deployment settings
3. **Environment**: Make sure to use `NEXT_PUBLIC_` prefix for client-side access

## Notes

- The system checks for both `NEXT_PUBLIC_MAINTENANCE_MODE` and `NEXT_PUBLIC_COMING_SOON_MODE`
- If either is set to `'true'`, maintenance mode is enabled
- The Coming Soon page already existed - we enhanced it with wishlist functionality
- Your existing beta-wishlist system remains fully functional during maintenance mode
- Users can still register, authenticate, and join the waitlist even in maintenance mode
