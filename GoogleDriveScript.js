/**
 * GOOGLE APPS SCRIPT FOR NIXPLAY PHOTO FEED
 *
 * Follow these 5 easy steps:
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
 * 5. Paste that Web App URL into your frame app.
 *
 * Output formats:
 *   default:              ["https://lh3.googleusercontent.com/d/<id>", ...]  (this web app)
 *   ?format=clearframe:   [{name, url, digest}, ...]                       (native ClearFrame app)
 */

function doGet(e) {
  // Put your Google Drive Folder ID here:
  var FOLDER_ID = "PASTE_YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";
  // Longest side for ClearFrame downloads; fits a 1280x800 panel in either orientation
  var CLEARFRAME_MAX_SIZE = 1280;
  var format = (e && e.parameter && e.parameter.format) || "";

  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFiles();
    var photoUrls = [];
    var photos = [];

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
        var id = file.getId();
        var url = "https://lh3.googleusercontent.com/d/" + id;
        photoUrls.push(url);

        // Name changes whenever the file is edited, so the frame re-downloads it.
        // Google serves the sized copy as JPEG regardless of the original format.
        var version = file.getLastUpdated().getTime();
        photos.push({
          name: id + "_" + version + ".jpg",
          url: url + "=s" + CLEARFRAME_MAX_SIZE,
          digest: id + "_" + version
        });
      }
    }

    var output = format === "clearframe" ? photos : photoUrls;
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
