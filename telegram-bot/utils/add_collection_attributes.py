import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def add_missing_attributes():
    """Add missing attributes to the telegram_members collection"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Adding missing attributes to collection...")
        print(f"Database ID: {database_id}")
        print(f"Collection ID: {collection_id}")
        
        # Missing attributes to add
        missing_attributes = [
            {
                'key': 'chat_id',
                'type': 'string',
                'size': 255,
                'required': False,
                'array': False,
                'default': ''
            },
            {
                'key': 'chat_title', 
                'type': 'string',
                'size': 255,
                'required': False,
                'array': False,
                'default': ''
            },
            {
                'key': 'chat_type',
                'type': 'string', 
                'size': 50,
                'required': False,
                'array': False,
                'default': ''
            },
            {
                'key': 'old_status',
                'type': 'string',
                'size': 50,
                'required': False,
                'array': False,
                'default': ''
            },
            {
                'key': 'new_status',
                'type': 'string',
                'size': 50,
                'required': False,
                'array': False,
                'default': ''
            },
            {
                'key': 'updated_at',
                'type': 'datetime',
                'required': False,
                'array': False
            }
        ]
        
        # Add each missing attribute
        for attr in missing_attributes:
            try:
                print(f"\nAdding attribute: {attr['key']} ({attr['type']})")
                
                if attr['type'] == 'string':
                    result = databases.create_string_attribute(
                        database_id=database_id,
                        collection_id=collection_id,
                        key=attr['key'],
                        size=attr['size'],
                        required=attr['required'],
                        default=attr.get('default', None),
                        array=attr['array']
                    )
                elif attr['type'] == 'datetime':
                    result = databases.create_datetime_attribute(
                        database_id=database_id,
                        collection_id=collection_id,
                        key=attr['key'],
                        required=attr['required'],
                        array=attr['array']
                    )
                
                print(f"✅ Successfully added attribute: {attr['key']}")
                
            except AppwriteException as e:
                if e.code == 409:  # Attribute already exists
                    print(f"⚠️  Attribute {attr['key']} already exists")
                else:
                    print(f"❌ Error adding attribute {attr['key']}: {e.message}")
            except Exception as e:
                print(f"❌ Unexpected error adding attribute {attr['key']}: {str(e)}")
        
        print(f"\n🔄 Waiting for attributes to be ready...")
        print("Note: It may take a few moments for the attributes to be fully ready.")
        print("You can check the Appwrite console to verify all attributes have been created.")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    add_missing_attributes()
