//this is "API" for managing google Drive without need of OAuth or Service Accounts
//if you want to use google drive as your file server go to 
//https://script.google.com/
//and create script with this code as WebAPI
function doPost(e) {
    try {
        var jsonData = JSON.parse(e.postData.contents);
        var folderName = "Kyanite";
        var fileName = jsonData.filename;
        var contentBase64 = jsonData.content;

        var folders = DriveApp.getFoldersByName(folderName);
        var folder;

        if (folders.hasNext()) {
            folder = folders.next();
        } else {
            folder = DriveApp.createFolder(folderName);
        }

        // Check if an old file with the same name exists and rename it as a backup
        var files = folder.getFilesByName(fileName);
        while (files.hasNext()) {
            var oldFile = files.next();

            var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH-mm-ss");
            var fileExtension = fileName.indexOf('.') !== -1 ? fileName.split('.').pop() : '';
            var baseName = fileExtension ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            var backupName = baseName + "_backup_" + timestamp + (fileExtension ? "." + fileExtension : "");

            oldFile.setName(backupName);
        }

        // Save the new file
        var blob = Utilities.newBlob(Utilities.base64Decode(contentBase64), 'application/octet-stream', fileName);
        var newFile = folder.createFile(blob);

        return ContentService.createTextOutput(JSON.stringify({ status: "success", id: newFile.getId() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
    catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    try {
        var fileName = e.parameter.filename;
        var folderName = "Kyanite";

        var folders = DriveApp.getFoldersByName(folderName);

        if (!folders.hasNext()) {
            return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Directory does not exist" })).setMimeType(ContentService.MimeType.JSON);
        }

        var folder = folders.next();
        var files = folder.getFilesByName(fileName);

        if (files.hasNext()) {
            var file = files.next();
            var base64Content = Utilities.base64Encode(file.getBlob().getBytes());

            return ContentService.createTextOutput(JSON.stringify({
                status: "success",
                filename: fileName,
                content: base64Content
            })).setMimeType(ContentService.MimeType.JSON);
        }
        else {
            return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "File not found" })).setMimeType(ContentService.MimeType.JSON);
        }
    }
    catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
}