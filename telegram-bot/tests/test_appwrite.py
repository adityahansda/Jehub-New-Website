import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_appwrite_connection():
    """Test Appwrite connection and create collection if needed"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Testing connection to Appwrite...")
        print(f"Endpoint: {os.getenv('APPWRITE_ENDPOINT')}")
        print(f"Project ID: {os.getenv('APPWRITE_PROJECT_ID')}")
        print(f"Database ID: {database_id}")
        print(f"Collection ID: {collection_id}")
        
        # Try to get the collection
        try:
            collection = databases.get_collection(database_id, collection_id)
            print(f"✅ Collection '{collection_id}' already exists")
            print(f"Collection name: {collection['name']}")
            return True
        except AppwriteException as e:
            if e.code == 404:
                print(f"❌ Collection '{collection_id}' not found. Need to create it.")
                print("Please create the collection in the Appwrite console with the following attributes:")
                print("- user_id (string)")
                print("- username (string)")
                print("- first_name (string)")
                print("- last_name (string)")
                print("- chat_id (string)")
                print("- chat_title (string)")
                print("- chat_type (string)")
                print("- old_status (string)")
                print("- new_status (string)")
                print("- is_bot (boolean)")
                print("- updated_at (string)")
                print("- language_code (string)")
                return False
            else:
                print(f"❌ Error accessing collection: {e.message}")
                return False
    
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_appwrite_connection()
