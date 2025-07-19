import { validateAllPdfs, autoCleanupDeletedNotes, ValidationReport } from '../lib/pdfValidation';

/**
 * Log validation results to console
 */
function logValidationResults(report: ValidationReport) {
  console.log('\n=== PDF Validation Report ===');
  console.log(`Total PDFs checked: ${report.totalChecked}`);
  console.log(`✅ Valid PDFs: ${report.validUrls}`);
  console.log(`❌ Deleted PDFs: ${report.deletedUrls}`);
  console.log(`⚠️ Error PDFs: ${report.errorUrls}`);
  
  if (report.deletedUrls > 0) {
    console.log('\n🗑️ Deleted PDFs:');
    report.results
      .filter(r => r.status === 'deleted')
      .forEach(r => console.log(`  - ${r.title} (${r.githubUrl})`));
  }
  
  if (report.errorUrls > 0) {
    console.log('\n⚠️ Error PDFs:');
    report.results
      .filter(r => r.status === 'error')
      .forEach(r => console.log(`  - ${r.title} (${r.error || 'Unknown error'})`));
  }
  
  console.log('=============================\n');
}

/**
 * Run PDF validation only (no cleanup)
 */
export async function runValidationOnly(): Promise<ValidationReport> {
  console.log('🔍 Starting PDF validation...');
  
  try {
    const report = await validateAllPdfs();
    logValidationResults(report);
    return report;
  } catch (error) {
    console.error('❌ PDF validation failed:', error);
    throw error;
  }
}

/**
 * Run PDF validation with automatic cleanup
 */
export async function runValidationWithCleanup(): Promise<{
  report: ValidationReport;
  deletedCount: number;
  failedCount: number;
}> {
  console.log('🔍 Starting PDF validation with auto-cleanup...');
  
  try {
    const result = await autoCleanupDeletedNotes();
    
    logValidationResults(result.report);
    
    if (result.deletedCount > 0) {
      console.log(`🗑️ Automatically deleted ${result.deletedCount} notes from database`);
    }
    
    if (result.failedCount > 0) {
      console.log(`❌ Failed to delete ${result.failedCount} notes from database`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ PDF validation with cleanup failed:', error);
    throw error;
  }
}

/**
 * Schedule validation to run periodically
 * This would typically be used with a cron job or similar scheduling system
 */
export async function scheduleValidation(
  intervalHours: number = 24,
  cleanup: boolean = false
): Promise<void> {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`⏰ Scheduling PDF validation to run every ${intervalHours} hours`);
  
  const runValidation = async () => {
    try {
      if (cleanup) {
        await runValidationWithCleanup();
      } else {
        await runValidationOnly();
      }
    } catch (error) {
      console.error('Scheduled validation failed:', error);
    }
  };
  
  // Run immediately
  await runValidation();
  
  // Schedule recurring runs
  setInterval(runValidation, intervalMs);
}

/**
 * Send email notification about validation results
 * This is a placeholder - you'd need to implement actual email sending
 */
export async function sendValidationNotification(
  report: ValidationReport,
  adminEmail: string = 'admin@example.com'
): Promise<void> {
  if (report.deletedUrls === 0 && report.errorUrls === 0) {
    console.log('✅ No issues found, skipping notification');
    return;
  }
  
  const subject = `PDF Validation Alert - ${report.deletedUrls} deleted, ${report.errorUrls} errors`;
  const body = `
PDF Validation Report:
- Total checked: ${report.totalChecked}
- Valid: ${report.validUrls}
- Deleted (404): ${report.deletedUrls}
- Errors: ${report.errorUrls}

${report.deletedUrls > 0 ? `
Deleted PDFs:
${report.results
  .filter(r => r.status === 'deleted')
  .map(r => `- ${r.title} (${r.githubUrl})`)
  .join('\n')}
` : ''}

${report.errorUrls > 0 ? `
Error PDFs:
${report.results
  .filter(r => r.status === 'error')
  .map(r => `- ${r.title} (${r.error || 'Unknown error'})`)
  .join('\n')}
` : ''}

Please review and take appropriate action.
`;
  
  // TODO: Implement actual email sending
  console.log(`📧 Email notification would be sent to ${adminEmail}`);
  console.log('Subject:', subject);
  console.log('Body:', body);
}

/**
 * Main function to run validation with options
 */
export async function main() {
  const args = process.argv.slice(2);
  const cleanup = args.includes('--cleanup');
  const schedule = args.includes('--schedule');
  const interval = args.find(arg => arg.startsWith('--interval='))?.split('=')[1];
  const notify = args.includes('--notify');
  
  try {
    if (schedule) {
      const hours = interval ? parseInt(interval) : 24;
      await scheduleValidation(hours, cleanup);
    } else {
      let result;
      if (cleanup) {
        result = await runValidationWithCleanup();
      } else {
        const report = await runValidationOnly();
        result = { report, deletedCount: 0, failedCount: 0 };
      }
      
      if (notify) {
        await sendValidationNotification(result.report);
      }
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
