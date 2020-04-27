var path = require("path");
var zip = require("cross-zip");
// We should only zip the minimum necessary files, these are the minified js files.
// No js or ts files
// We do this by making a new temp directory containing all the files we want and removing
//  those we don't want then when it's time to zip, we zip the temp directory and when done
//  zipping, delete the temp directory
var inPath = path.join(__dirname, "../src");
var outPath = path.join(__dirname, '../dist/myFile.zip');
zip.zipSync(inPath, outPath);
