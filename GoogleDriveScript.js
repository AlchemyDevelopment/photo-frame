/**
 * GOOGLE APPS SCRIPT FOR NIXPLAY PHOTO FEED
 * 
 * Follow these 4 easy steps:
 * 1. Go to https://script.google.com/ and click "New project".
 * 2. Delete any code in the editor and paste the code below.
 * 3. Replace "PASTE_YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE" with your folder ID.
 *    (To find the Folder ID: Open the folder in Google Drive, and look at the URL in your browser:
 *     drive.google.com/drive/folders/1a2b3c4d5e... -> The letters/numbers after /folders/ is the ID).
 * 4. Click "Deploy" (top right) -> "New deployment":
 *    - Click the gear icon next to "Select type" -> choose "Web app".
 *    - Under "Execute as": Choose "Me".
 *    - Under "Who has access": Choose "Anyone".
 *    - Click "Deploy", authorize permissions, and copy the "Web app URL".
 * 5. Paste that Web App URL into your Lumina Photo Frame Settings!
 */

function doGet() {
  // Put your Google Drive Folder ID here:
  var FOLDER_ID = "PASTE_YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";
  
  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFiles();
    var photoUrls = [];
    
    // Only grab images (JPG, PNG, WEBP, etc.)
    var validTypes = [
      MimeType.JPEG,
      MimeType.PNG,
      MimeType.GIF,
      MimeType.BMP
    ];

    while (files.hasNext()) {
      var file = files.next();
      var mime = file.getMimeType();
      
      if (validTypes.indexOf(mime) !== -1 || mime.indexOf('image/') !== -1) {
        // High-resolution direct streaming URL
        photoUrls.push("https://lh3.googleusercontent.com/d/" + file.getId());
      }
    }
    
    var output = JSON.stringify(photoUrls);
    return ContentService.createTextOutput(output)
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
