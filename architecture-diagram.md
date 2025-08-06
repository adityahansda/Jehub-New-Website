# Telegram Bot System Architecture

## System Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Telegram Bot   │────────▶│   Appwrite      │◀────────│   Next.js App   │
│                 │         │   Database      │         │                 │
│  - Receives     │         │                 │         │  - Admin Panel  │
│    messages     │         │  - Collections  │         │  - Analytics    │
│  - Processes    │         │  - Real-time    │         │  - User Mgmt    │
│    commands     │         │  - Auth         │         │  - Reports      │
│  - Sends        │         │  - Storage      │         │                 │
│    responses    │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Database Collections Schema

### 1. `telegram_members` Collection

**Purpose**: Store information about Telegram group/channel members

| Field Name    | Type      | Required | Description                           |
|---------------|-----------|----------|---------------------------------------|
| `id`          | String    | Yes      | Unique document ID                    |
| `telegram_id` | Integer   | Yes      | Telegram user ID (unique)             |
| `username`    | String    | No       | Telegram username (without @)         |
| `first_name`  | String    | No       | User's first name                     |
| `last_name`   | String    | No       | User's last name                      |
| `status`      | String    | Yes      | active, left, banned, restricted      |
| `joined_at`   | DateTime  | Yes      | When user joined the group            |
| `left_at`     | DateTime  | No       | When user left (null if still active) |
| `is_bot`      | Boolean   | Yes      | Whether the user is a bot             |
| `language_code` | String  | No       | User's language preference            |
| `created_at`  | DateTime  | Yes      | Record creation timestamp             |
| `updated_at`  | DateTime  | Yes      | Last update timestamp                 |

**Indexes**:
- `telegram_id` (unique)
- `status`
- `joined_at`

### 2. `bot_messages` Collection

**Purpose**: Log bot interactions and messages

| Field Name     | Type      | Required | Description                          |
|----------------|-----------|----------|--------------------------------------|
| `id`           | String    | Yes      | Unique document ID                   |
| `message_id`   | Integer   | Yes      | Telegram message ID                  |
| `chat_id`      | Integer   | Yes      | Telegram chat ID                     |
| `user_id`      | Integer   | Yes      | Telegram user ID                     |
| `message_type` | String    | Yes      | text, photo, document, command, etc. |
| `content`      | String    | No       | Message content/text                 |
| `command`      | String    | No       | Bot command (if applicable)          |
| `response`     | String    | No       | Bot's response                       |
| `timestamp`    | DateTime  | Yes      | Message timestamp                    |
| `processed`    | Boolean   | Yes      | Whether message was processed        |
| `created_at`   | DateTime  | Yes      | Record creation timestamp            |

**Indexes**:
- `chat_id`
- `user_id`
- `timestamp`
- `command`

### 3. `bot_analytics` Collection

**Purpose**: Store analytics and usage statistics

| Field Name      | Type      | Required | Description                         |
|-----------------|-----------|----------|-------------------------------------|
| `id`            | String    | Yes      | Unique document ID                  |
| `date`          | Date      | Yes      | Analytics date (YYYY-MM-DD)         |
| `total_members` | Integer   | Yes      | Total active members                |
| `new_members`   | Integer   | Yes      | New members joined today            |
| `left_members`  | Integer   | Yes      | Members who left today              |
| `messages_sent` | Integer   | Yes      | Total messages sent by bot          |
| `commands_used` | Object    | Yes      | Command usage count (JSON object)   |
| `active_users`  | Integer   | Yes      | Users who interacted with bot       |
| `created_at`    | DateTime  | Yes      | Record creation timestamp           |

**Indexes**:
- `date` (unique)

### 4. `bot_settings` Collection

**Purpose**: Store bot configuration and settings

| Field Name       | Type      | Required | Description                        |
|------------------|-----------|----------|------------------------------------|
| `id`             | String    | Yes      | Unique document ID                 |
| `setting_key`    | String    | Yes      | Setting identifier (unique)        |
| `setting_value`  | String    | Yes      | Setting value                      |
| `setting_type`   | String    | Yes      | string, number, boolean, json      |
| `description`    | String    | No       | Setting description                |
| `is_active`      | Boolean   | Yes      | Whether setting is active          |
| `created_at`     | DateTime  | Yes      | Record creation timestamp          |
| `updated_at`     | DateTime  | Yes      | Last update timestamp              |

**Indexes**:
- `setting_key` (unique)
- `is_active`

## Data Flow

1. **Bot → Appwrite**: 
   - Store new member information
   - Log message interactions
   - Update analytics data
   - Read/write bot settings

2. **Next.js App ← Appwrite**:
   - Fetch member statistics
   - Display analytics dashboards
   - Manage bot settings
   - Generate reports
   - Real-time updates via Appwrite subscriptions

## Security Considerations

- Use Appwrite's built-in authentication for the Next.js app
- Implement proper permissions for each collection
- Bot should use a service account with limited permissions
- Sensitive data (like bot tokens) stored in Appwrite environment variables
- Rate limiting on API endpoints

## Appwrite Configuration Notes

- Enable real-time subscriptions for live updates
- Set up proper database rules and permissions
- Configure backup strategies
- Use Appwrite Functions for complex business logic
- Set up webhooks for external integrations if needed
