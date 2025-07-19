# PDF Validation System

A comprehensive system to validate GitHub PDF URLs in your Appwrite database and automatically handle deleted files.

## Features

- ✅ **URL Validation**: Check if GitHub PDFs are still accessible (not 404)
- 🗑️ **Auto-Cleanup**: Automatically remove deleted PDFs from database
- 📊 **Admin Dashboard**: Web interface to manage validation results
- 🚫 **User Notifications**: Show appropriate messages when PDFs are deleted
- 📧 **Email Alerts**: Optional email notifications for administrators
- ⏰ **Scheduled Tasks**: Run validation automatically

## Files Created

1. **`src/lib/pdfValidation.ts`** - Core validation logic
2. **`src/pages/AdminPdfValidation.tsx`** - Admin dashboard
3. **`src/utils/scheduledValidation.ts`** - Scheduled task utilities
4. **Updated `src/pages/NotesPreview.tsx`** - Shows deleted PDF messages
5. **Updated `src/pages/NotesDownload.tsx`** - Validates before download

## Usage

### 1. Admin Dashboard

Access the admin dashboard at `/admin-pdf-validation` to:
- Validate all PDFs in your database
- View detailed results (valid/deleted/error)
- Manually delete selected entries
- Auto-cleanup all deleted PDFs

### 2. Programmatic Usage

```typescript
import { validateAllPdfs, autoCleanupDeletedNotes, checkUrlStatus } from './lib/pdfValidation';

// Validate all PDFs
const report = await validateAllPdfs();
console.log(`Found ${report.deletedUrls} deleted PDFs`);

// Auto-cleanup deleted PDFs
const result = await autoCleanupDeletedNotes();
console.log(`Deleted ${result.deletedCount} notes from database`);

// Check single URL
const status = await checkUrlStatus('https://github.com/user/repo/raw/main/file.pdf');
console.log(status.status); // 'valid' | 'deleted' | 'error'
```

### 3. Scheduled Tasks

Run validation as a scheduled task:

```bash
# Run validation only
npx ts-node src/utils/scheduledValidation.ts

# Run with auto-cleanup
npx ts-node src/utils/scheduledValidation.ts --cleanup

# Schedule to run every 24 hours
npx ts-node src/utils/scheduledValidation.ts --schedule --interval=24

# Send email notifications
npx ts-node src/utils/scheduledValidation.ts --notify
```

### 4. Set up Cron Job

Add to your crontab for automatic daily validation:

```bash
# Daily at 2 AM
0 2 * * * cd /path/to/your/project && npx ts-node src/utils/scheduledValidation.ts --cleanup
```

## User Experience

### When a PDF is deleted:

1. **NotesPreview page**: Shows a red alert message explaining the PDF is deleted
2. **NotesDownload page**: Prevents download and shows error message
3. **PDF Preview**: Displays "PDF Not Available" with contact info
4. **Download attempts**: Blocked with user-friendly error message

### Error Messages:

- "This PDF file has been deleted from GitHub and is no longer available."
- "Contact the administrator for assistance."
- "The file was removed from the repository or became private."

## Configuration

### Environment Variables

Make sure these are set in your `.env` file:

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID=your_collection_id
```

### Customization

You can customize the validation behavior by modifying:

- **Check frequency**: Change the interval in scheduled tasks
- **Error messages**: Update the UI messages in the components
- **Email notifications**: Implement actual email sending in `sendValidationNotification`
- **Validation logic**: Extend `checkUrlStatus` for other URL types

## API Reference

### `validateAllPdfs()`
Validates all PDFs in the database and returns a detailed report.

**Returns**: `Promise<ValidationReport>`

### `autoCleanupDeletedNotes()`
Automatically deletes all notes with 404 URLs from the database.

**Returns**: `Promise<{ deletedCount: number; failedCount: number; report: ValidationReport }>`

### `checkUrlStatus(url: string)`
Checks if a single URL is accessible.

**Returns**: `Promise<{ isValid: boolean; status: 'valid' | 'deleted' | 'error'; statusCode?: number; error?: string }>`

### `deleteNoteFromDatabase(noteId: string)`
Deletes a single note from the database.

**Returns**: `Promise<void>`

### `batchDeleteNotes(noteIds: string[])`
Deletes multiple notes from the database.

**Returns**: `Promise<{ success: string[]; failed: string[] }>`

## Security Considerations

- Admin dashboard should be protected with authentication
- Validate user permissions before allowing deletion
- Consider rate limiting for URL validation
- Monitor API usage to prevent abuse

## Troubleshooting

### Common Issues:

1. **CORS errors**: The system uses HEAD requests to check URLs
2. **Rate limiting**: GitHub may rate limit requests
3. **Network timeouts**: Some URLs may take time to respond
4. **Authentication**: Private repos will show as 404

### Debug Information:

The NotesPreview page includes debug information showing:
- Original GitHub URL
- Transformed URL for viewing
- Download URL format

## Best Practices

1. **Regular validation**: Run daily to catch issues early
2. **User communication**: Always inform users when PDFs are unavailable
3. **Backup strategy**: Consider backing up PDFs before deletion
4. **Monitoring**: Set up alerts for high deletion rates
5. **Testing**: Test with both valid and invalid URLs

## Future Enhancements

- Support for other file hosting services
- Bulk file migration tools
- Advanced reporting and analytics
- Integration with GitHub webhook for real-time updates
- Automatic re-upload of deleted files

## Support

If you need help with the PDF validation system:

1. Check the debug information in the browser console
2. Review the validation report for detailed errors
3. Contact the administrator for assistance
4. Check GitHub repository status and permissions
