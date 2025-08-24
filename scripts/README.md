# Knowledge Base Scripts

This directory contains scripts to manage the AI knowledge base for JEHUB.

## Setup

1. Install the required Appwrite dependency:
```bash
npm install node-appwrite
```

2. Ensure your .env.local contains the required values:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=...your_project_id...
NEXT_PUBLIC_APPWRITE_DATABASE_ID=...your_database_id...
NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID=ai_knowledge_collection
APPWRITE_API_KEY=...your_secret_api_key...
```

Do not print or commit your APPWRITE_API_KEY.

## Running the Script

To add comprehensive knowledge entries about Aditya and JEHUB:

```bash
npm run kb:add:aditya
```

## What This Script Adds

The script will add 4 detailed knowledge base entries:

1. **About Aditya Hansda - JEHUB Founder**: Comprehensive information about Aditya's background, education, and achievements
2. **JEHUB Platform Overview**: Detailed platform features and services
3. **Aditya Hansda Contact and Social**: Professional background and role information
4. **JEHUB Points System by Aditya**: Complete explanation of the gamified points system

## After Running

Once you've successfully added the entries:

1. Restart your Next.js development server:
   ```bash
   npm run dev
   ```

2. Test the AI chat by asking questions about:
   - "Who is Aditya Hansda?"
   - "Tell me about JEHUB"
   - "How does the points system work?"
   - "How can I contact the founder?"

The AI should now provide much more comprehensive and accurate responses using the knowledge base entries.

## Troubleshooting

- Make sure your Appwrite API key has the correct permissions for the database
- Verify that your project ID, database ID, and collection ID are correct in the script
- Check that the `ai_knowledge_collection` exists in your Appwrite database
