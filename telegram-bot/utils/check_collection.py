import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_collection_attributes():
    """Check what attributes are currently in the collection"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Checking collection attributes...")
        print(f"Database ID: {database_id}")
        print(f"Collection ID: {collection_id}")
        
        # Get collection details
        collection = databases.get_collection(database_id, collection_id)
        
        print(f"\nCollection name: {collection['name']}")
        print(f"Collection ID: {collection['$id']}")
        print(f"Total attributes: {len(collection['attributes'])}")
        
        print("\nExisting attributes:")
        for attr in collection['attributes']:
            print(f"  - {attr['key']} ({attr['type']}) - Required: {attr['required']}")
        
        # Required attributes for our bot
        required_attributes = {
            'user_id': 'string',
            'username': 'string', 
            'first_name': 'string',
            'last_name': 'string',
            'chat_id': 'string',
            'chat_title': 'string',
            'chat_type': 'string',
            'old_status': 'string',
            'new_status': 'string',
            'is_bot': 'boolean',
            'updated_at': 'string',
            'language_code': 'string'
        }
        
        existing_attr_keys = [attr['key'] for attr in collection['attributes']]
        missing_attrs = [key for key in required_attributes.keys() if key not in existing_attr_keys]
        
        if missing_attrs:
            print(f"\n❌ Missing attributes: {missing_attrs}")
            print("\nYou need to add these attributes to your Appwrite collection:")
            for attr in missing_attrs:
                print(f"  - {attr} ({required_attributes[attr]})")
        else:
            print("\n✅ All required attributes are present!")
            
    except AppwriteException as e:
        print(f"❌ Appwrite error: {e.message} (Code: {e.code})")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    check_collection_attributes()
