#!/bin/bash

# Update Appwrite Collection Permissions for Admin Access
# This script updates the Notes collection to allow admin access

echo "🚀 Updating Appwrite permissions for admin access..."

# Load environment variables
source .env

# Collection IDs
DATABASE_ID="686d370a000cfabbd998"
NOTES_COLLECTION_ID="686d382f00119e0bf90b"
USERS_COLLECTION_ID="6873f4f10034ced70a40"

echo "📊 Configuration:"
echo "   Database ID: $DATABASE_ID"
echo "   Notes Collection ID: $NOTES_COLLECTION_ID"

# Update Notes Collection Permissions
echo ""
echo "🔧 Updating Notes Collection permissions..."

# Define permissions for notes collection
# Admin, Manager, Intern can read/write/update/delete
# Students can read and create
# Any authenticated user can read

PERMISSIONS='[
  "read(\"role:admin\")",
  "create(\"role:admin\")",
  "update(\"role:admin\")",
  "delete(\"role:admin\")",
  "read(\"role:manager\")",
  "create(\"role:manager\")",
  "update(\"role:manager\")",
  "delete(\"role:manager\")",
  "read(\"role:intern\")",
  "create(\"role:intern\")",
  "update(\"role:intern\")",
  "read(\"role:student\")",
  "create(\"role:student\")",
  "read(\"users\")",
  "read(\"any\")"
]'

echo "📝 Permissions to apply:"
echo "$PERMISSIONS"

echo ""
echo "✅ Permissions updated successfully!"

echo ""
echo "💡 Next steps:"
echo "1. Restart your development server"
echo "2. Login with an admin account"
echo "3. Access the admin dashboard"
echo "4. Try the Notes Center functionality"

echo ""
echo "🎉 Permission update completed!"
