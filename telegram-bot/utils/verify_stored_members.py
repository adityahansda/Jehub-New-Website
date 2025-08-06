import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def verify_stored_members():
    """Verify stored telegram members in Appwrite database"""
    try:
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        databases = Databases(client)
        database_id = os.getenv('APPWRITE_DATABASE_ID')
        collection_id = os.getenv('APPWRITE_COLLECTION_ID')
        
        print(f"Fetching stored telegram members...")
        print(f"Database ID: {database_id}")
        print(f"Collection ID: {collection_id}")
        
        # List documents in the collection
        try:
            result = databases.list_documents(
                database_id,
                collection_id
            )
            
            print(f"\n✅ Found {result['total']} total documents")
            print(f"📄 Showing {len(result['documents'])} documents:\n")
            
            for i, doc in enumerate(result['documents'], 1):
                print(f"{i}. User ID: {doc['user_id']}")
                print(f"   Name: {doc['first_name']} {doc['last_name']}")
                print(f"   Username: @{doc['username']}" if doc['username'] else "   Username: (not set)")
                print(f"   Status: {doc['status']}")
                print(f"   Chat: {doc['chat_title']} ({doc['chat_id']})")
                print(f"   Is Bot: {doc['is_bot']}")
                print(f"   Updated: {doc['updated_at']}")
                print(f"   Document ID: {doc['$id']}")
                print("-" * 50)
            
            print(f"\n📊 Summary:")
            print(f"   Total members: {result['total']}")
            
            # Count by status
            status_counts = {}
            for doc in result['documents']:
                status = doc['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print(f"   By status:")
            for status, count in status_counts.items():
                print(f"     - {status}: {count}")
                
        except AppwriteException as e:
            print(f"❌ Appwrite error: {e.message} (Code: {e.code})")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")

if __name__ == "__main__":
    verify_stored_members()
