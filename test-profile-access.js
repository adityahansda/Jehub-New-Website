const { chromium } = require('playwright');

(async () => {
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // Mobile viewport
  });
  const page = await context.newPage();

  try {
    // Navigate to the homepage
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Try to click the profile icon in the header
    console.log('Testing profile icon click...');
    await page.click('a[href="/profile"]');
    
    // Wait for navigation
    await page.waitForURL('**/profile');
    
    console.log('✅ Profile page accessed successfully!');
    console.log('Current URL:', page.url());
    
    // Check if profile content is visible
    const profileContent = await page.locator('text=Profile').first();
    if (await profileContent.isVisible()) {
      console.log('✅ Profile content is visible');
    } else {
      console.log('❌ Profile content is not visible');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
