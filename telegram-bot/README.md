# Telegram Bot with Appwrite Integration

This Telegram bot monitors chat member updates (joins, leaves, status changes) and stores the information in an Appwrite database.

## Features

- **Long-polling**: Uses Telegram's long-polling mechanism to listen for updates
- **ChatMemberHandler**: Specifically handles chat member events (joins, leaves, promotions, etc.)
- **Appwrite Integration**: Upserts member documents using Appwrite's Server API
- **Error Handling**: Comprehensive exception handling with logging to stdout
- **Environment Configuration**: Uses environment variables for secure configuration

## Setup

### 1. Prerequisites

- Python 3.7+
- Telegram Bot Token (from @BotFather)
- Appwrite project with database and collection set up

### 2. Installation

```bash
# Clone or create the project directory
mkdir telegram-bot && cd telegram-bot

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id_here
   APPWRITE_API_KEY=your_server_api_key_here
   APPWRITE_DATABASE_ID=your_database_id_here
   APPWRITE_COLLECTION_ID=your_collection_id_here
   ```

### 4. Appwrite Database Schema

Create a collection in your Appwrite database with the following attributes:

- `user_id` (String, Required)
- `username` (String, Optional)
- `first_name` (String, Optional)
- `last_name` (String, Optional)
- `chat_id` (String, Required)
- `chat_title` (String, Optional)
- `chat_type` (String, Required)
- `old_status` (String, Required)
- `new_status` (String, Required)
- `is_bot` (Boolean, Required)
- `updated_at` (String, Required)
- `language_code` (String, Optional)

## Usage

Run the bot:

```bash
python bot.py
```

The bot will:
1. Start long-polling for Telegram updates
2. Listen for chat member changes
3. Create or update member documents in Appwrite
4. Log all activities to stdout

## PythonAnywhere Deployment (One-Command Setup)

To deploy this bot on PythonAnywhere, follow these steps:

1. Upload all the bot files to your PythonAnywhere account
2. Open a Bash console in PythonAnywhere
3. Navigate to your bot directory
4. Run the setup script with a single command:

```bash
chmod +x setup.sh && ./setup.sh
```

This script will:
- Create and activate a virtual environment
- Install all dependencies
- Set up your environment file
- Create helper scripts for running the bot
- Verify your setup

5. After running the setup script:
   - Edit your `.env` file with your credentials
   - Run `python setup_task.py` to get the command for PythonAnywhere tasks
   - Set up a scheduled or always-on task in PythonAnywhere using the provided command

## Bot Permissions

Make sure your bot has the following permissions in the target chats:
- Read member updates
- Access to chat member information

## Error Handling

The bot includes comprehensive error handling:
- Validates all required environment variables on startup
- Catches and logs Telegram API errors
- Handles Appwrite API errors (including document not found scenarios)
- Provides detailed logging for troubleshooting

## Logging

All activities are logged to stdout with timestamps, including:
- Bot initialization
- Chat member updates
- Database operations (create/update)
- Error messages with stack traces

## Document Structure

Each member document in Appwrite contains:
- User information (ID, username, names)
- Chat information (ID, title, type)
- Status change information (old/new status)
- Metadata (timestamp, language, bot flag)

Documents are uniquely identified by `{user_id}_{chat_id}` to track users across different chats.
