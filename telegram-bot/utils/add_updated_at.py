import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_updated_at_attribute():
    """Add the missing updated_at attribute as string"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Adding updated_at attribute as string...")
        
        try:
            result = databases.create_string_attribute(
                database_id=database_id,
                collection_id=collection_id,
                key='updated_at',
                size=50,
                required=False,
                default='',
                array=False
            )
            print(f"✅ Successfully added updated_at attribute as string")
            
        except AppwriteException as e:
            if e.code == 409:
                print(f"⚠️  Attribute updated_at already exists")
            else:
                print(f"❌ Error adding updated_at attribute: {e.message}")
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    add_updated_at_attribute()
