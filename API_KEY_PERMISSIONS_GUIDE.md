# API Key Permissions Guide for User Deletion

## 🔍 **Current Issue**
Your API key doesn't have the required permissions to delete users from both the database and authentication system.

## 📊 **Current Permission Status**
Based on the permission check:
- ✅ **Database Read**: `true`
- ❌ **Database Delete**: `false` 
- ✅ **Auth List Users**: `true`
- ❌ **Auth Delete Users**: `false`

## 🔧 **How to Fix API Key Permissions**

### **Step 1: Access Appwrite Console**
1. Go to your Appwrite Console
2. Navigate to **Settings** → **API Keys**
3. Find your current API key or create a new one

### **Step 2: Update API Key Permissions**

#### **Option A: Use Admin Role (Recommended)**
1. Click on your API key
2. Set **Role** to `Admin`
3. This gives full access to all services

#### **Option B: Set Specific Permissions**
If you prefer granular permissions, set these specific permissions:

**Databases:**
- ✅ **Read** (already working)
- ✅ **Write** (for updates)
- ✅ **Delete** (required for user deletion)

**Users:**
- ✅ **Read** (already working)
- ✅ **Write** (for user updates)
- ✅ **Delete** (required for user deletion)

### **Step 3: Update Environment Variable**
After updating the API key, copy the new key and update your `.env.local`:
```env
APPWRITE_API_KEY=your_new_api_key_here
```

### **Step 4: Restart Development Server**
```bash
npm run dev
```

### **Step 5: Test Permissions**
Visit: `http://localhost:3000/api/admin/check-permissions`

You should see:
```json
{
  "permissions": {
    "database": {
      "canRead": true,
      "canDelete": true
    },
    "auth": {
      "canListUsers": true,
      "canDeleteUsers": true
    }
  }
}
```

## 🚨 **Alternative Solution (If API Key Can't Be Updated)**

If you can't update the API key permissions, you can still delete users from the database only:

1. The system will now show a clear error message when permissions are missing
2. You'll get specific feedback about what permissions are needed
3. The user will still be deleted from the database (if that permission exists)

## 🔍 **Testing the Fix**

1. **Test Permissions**: `http://localhost:3000/api/admin/check-permissions`
2. **Test Basic Connectivity**: `http://localhost:3000/api/admin/test-delete-user`
3. **Try User Deletion**: Use the admin panel to delete a test user

## 📝 **Expected Behavior After Fix**

- ✅ **Full Success**: User deleted from both database and auth system
- ⚠️ **Partial Success**: User deleted from database only (if auth permissions missing)
- ❌ **Clear Error**: Specific permission error with instructions

## 🆘 **Still Having Issues?**

If you're still having problems after updating permissions:

1. **Check API Key Scope**: Ensure the API key has access to your project
2. **Verify Project ID**: Make sure you're using the correct project
3. **Check Collection Permissions**: Ensure the users collection allows delete operations
4. **Contact Support**: If using Appwrite Cloud, check their documentation for admin permissions 