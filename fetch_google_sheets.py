#!/usr/bin/env python3
"""
Google Sheets API Data Fetcher
This script fetches data from a Google Sheet using service account authentication.
"""

import json
import os
from google.auth.transport.requests import Request
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Configuration
SPREADSHEET_ID = '1VkeB8EJfTBugC_R7_EBAosePtF8daJdxrpg5j1heDU8'
SERVICE_ACCOUNT_EMAIL = 'sheets-accessor@jehub25.iam.gserviceaccount.com'

# Scopes required for Google Sheets API
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

def authenticate_google_sheets():
    """
    Authenticate with Google Sheets API using service account credentials.
    
    Returns:
        Google Sheets service object
    """
    try:
        # Look for credentials file in current directory or common locations
        credential_files = [
            'jehub25-cdc2d0929d51.json',
            'service_account_credentials.json',
            'credentials.json',
            'google_credentials.json',
            os.path.expanduser('~/credentials.json'),
            os.path.expanduser('~/service_account_credentials.json')
        ]
        
        credentials_path = None
        for file_path in credential_files:
            if os.path.exists(file_path):
                credentials_path = file_path
                break
        
        if not credentials_path:
            raise FileNotFoundError(
                f"Service account credentials file not found. Please ensure one of these files exists:\n"
                f"- service_account_credentials.json\n"
                f"- credentials.json\n"
                f"- google_credentials.json\n"
                f"Make sure the file contains the JSON key for {SERVICE_ACCOUNT_EMAIL}"
            )
        
        print(f"Using credentials file: {credentials_path}")
        
        # Load and validate credentials
        credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=SCOPES
        )
        
        # Build the service object
        service = build('sheets', 'v4', credentials=credentials)
        print(f"Successfully authenticated with service account: {SERVICE_ACCOUNT_EMAIL}")
        
        return service
        
    except Exception as e:
        print(f"Authentication failed: {str(e)}")
        return None

def fetch_sheet_data(service, range_name='Sheet1'):
    """
    Fetch data from the Google Sheet.
    
    Args:
        service: Google Sheets service object
        range_name: The range to fetch (default: 'Sheet1' for entire first sheet)
    
    Returns:
        List of rows from the sheet
    """
    try:
        # Call the Sheets API
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=range_name
        ).execute()
        
        values = result.get('values', [])
        
        if not values:
            print('No data found in the sheet.')
            return []
        
        print(f'Successfully fetched {len(values)} rows from the sheet.')
        return values
        
    except HttpError as error:
        print(f'An error occurred while fetching data: {error}')
        return []

def get_sheet_info(service):
    """
    Get information about the spreadsheet (sheet names, etc.)
    
    Args:
        service: Google Sheets service object
    
    Returns:
        Spreadsheet metadata
    """
    try:
        sheet_metadata = service.spreadsheets().get(
            spreadsheetId=SPREADSHEET_ID
        ).execute()
        
        sheets = sheet_metadata.get('sheets', [])
        print(f"Spreadsheet Title: {sheet_metadata.get('properties', {}).get('title', 'Unknown')}")
        print(f"Available sheets:")
        
        for sheet in sheets:
            properties = sheet.get('properties', {})
            title = properties.get('title', 'Unknown')
            sheet_id = properties.get('sheetId', 'Unknown')
            print(f"  - {title} (ID: {sheet_id})")
        
        return sheet_metadata
        
    except HttpError as error:
        print(f'An error occurred while fetching sheet info: {error}')
        return None

def display_data(data, max_rows=10):
    """
    Display the fetched data in a readable format.
    
    Args:
        data: List of rows from the sheet
        max_rows: Maximum number of rows to display
    """
    if not data:
        print("No data to display.")
        return
    
    print(f"\n{'='*80}")
    print("GOOGLE SHEET DATA")
    print(f"{'='*80}")
    
    # Display headers if available
    if len(data) > 0:
        headers = data[0]
        print("Headers:", " | ".join(headers))
        print("-" * 80)
    
    # Display data rows
    rows_to_show = min(len(data), max_rows)
    for i, row in enumerate(data[:rows_to_show]):
        print(f"Row {i+1}: {' | '.join(str(cell) for cell in row)}")
    
    if len(data) > max_rows:
        print(f"... and {len(data) - max_rows} more rows")
    
    print(f"{'='*80}")

def save_data_to_file(data, filename='google_sheets_data.json'):
    """
    Save the fetched data to a JSON file.
    
    Args:
        data: List of rows from the sheet
        filename: Name of the output file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data saved to {filename}")
    except Exception as e:
        print(f"Error saving data to file: {str(e)}")

def main():
    """
    Main function to fetch and display Google Sheets data.
    """
    print("Google Sheets Data Fetcher")
    print("=" * 50)
    print(f"Target Spreadsheet ID: {SPREADSHEET_ID}")
    print(f"Service Account: {SERVICE_ACCOUNT_EMAIL}")
    
    # Authenticate
    service = authenticate_google_sheets()
    if not service:
        print("Failed to authenticate. Please check your credentials.")
        return
    
    # Get sheet information
    print("\nFetching sheet information...")
    sheet_info = get_sheet_info(service)
    
    if not sheet_info:
        print("Failed to get sheet information.")
        return
    
    # Fetch data from the default sheet
    print(f"\nFetching data from spreadsheet...")
    data = fetch_sheet_data(service)
    
    if data:
        # Display the data
        display_data(data)
        
        # Save to file
        save_data_to_file(data)
        
        # Ask user if they want to fetch specific ranges
        print(f"\nTotal rows fetched: {len(data)}")
        print("To fetch specific ranges, you can modify the range_name parameter in fetch_sheet_data()")
        print("Examples: 'A1:E10', 'Sheet1!A:C', 'Data!B2:F100'")
    
    print("\nScript execution completed.")

if __name__ == '__main__':
    main()
