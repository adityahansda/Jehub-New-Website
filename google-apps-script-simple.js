function doGet(e) {
  return ContentService
    .createTextOutput("GET request received")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet (make sure you have a spreadsheet bound to this script)
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Check if headers exist, if not create them
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      // Add headers if sheet is empty
      sheet.getRange(1, 1, 1, 8).setValues([
        ["Name", "Email", "College", "Year", "Date", "Time", "Day", "IP Address"]
      ]);
    }
    
    // Append the new data
    sheet.appendRow([
      data.studentName || "",
      data.collegeEmail || "",
      data.collegeName || "",
      data.yearOfStudy || "",
      data.date || "",
      data.time || "",
      data.day || "",
      data.ip || ""
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: "success",
        message: "Data saved successfully" 
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: "error",
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS request
function doOptions(e) {
  return ContentService
    .createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
