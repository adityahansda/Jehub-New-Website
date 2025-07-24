function doGet(e) {
  const output = ContentService.createTextOutput("GET request received");
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setHeader("Access-Control-Allow-Origin", "*");
  output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  output.setHeader("Access-Control-Allow-Headers", "*");
  return output;
}

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
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
    const response = ContentService.createTextOutput(JSON.stringify({ 
      result: "success",
      message: "Data saved successfully" 
    }));
    response.setMimeType(ContentService.MimeType.JSON);
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "*");
    
    return response;
    
  } catch (error) {
    // Return error response
    const errorResponse = ContentService.createTextOutput(JSON.stringify({ 
      result: "error",
      message: error.toString() 
    }));
    errorResponse.setMimeType(ContentService.MimeType.JSON);
    errorResponse.setHeader("Access-Control-Allow-Origin", "*");
    errorResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    errorResponse.setHeader("Access-Control-Allow-Headers", "*");
    
    return errorResponse;
  }
}

// Handle preflight OPTIONS request
function doOptions(e) {
  const output = ContentService.createTextOutput("");
  output.setMimeType(ContentService.MimeType.TEXT);
  output.setHeader("Access-Control-Allow-Origin", "*");
  output.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  output.setHeader("Access-Control-Allow-Headers", "*");
  return output;
}
