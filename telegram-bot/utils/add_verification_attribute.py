import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_wishlist_verification_attribute():
    """Add the is_wishlist_verified attribute to the collection"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Adding 'is_wishlist_verified' attribute to collection: {collection_id}")
        
        try:
            # Create a boolean attribute for verification status
            databases.create_boolean_attribute(
                database_id=database_id,
                collection_id=collection_id,
                key='is_wishlist_verified',
                required=False,  # Make it optional so we can set default
                default=False,  # Default to not verified
                array=False
            )
            print(f"✅ Successfully added 'is_wishlist_verified' attribute.")
            
        except AppwriteException as e:
            if e.code == 409:  # Attribute already exists
                print(f"⚠️  Attribute 'is_wishlist_verified' already exists.")
            else:
                print(f"❌ Error adding attribute: {e.message} (Code: {e.code})")
                raise e
        
    except Exception as e:
        print(f"❌ An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    add_wishlist_verification_attribute()
