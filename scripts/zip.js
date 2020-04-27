"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var path = require("path");
var fs = require("fs-extra");
var czip = require("cross-zip");
function zip(outName) {
    var srcPath = path.join(__dirname, "../src");
    var tmpPath = path.join(__dirname, "./tmp");
    var outZipPath = path.join(__dirname, "../dist/" + outName + ".zip");
    console.log("Zipping src " + srcPath + " to " + outZipPath);
    var srcScripts = ["background", "custom_fonts", "main", "popup", "shared"];
    var excludedFiles = [];
    srcScripts.forEach(function (fileName) {
        excludedFiles.push(tmpPath + "/" + fileName + ".ts");
        excludedFiles.push(tmpPath + "/" + fileName + ".js");
    });
    fs.copySync(srcPath, tmpPath);
    excludedFiles.forEach(function (file) {
        fs.removeSync(file);
        console.log("Excluding " + file);
    });
    console.log("Zipping to " + outZipPath);
    czip.zipSync(tmpPath, outZipPath);
    console.log("Removing tmp " + tmpPath);
    fs.removeSync(tmpPath);
    console.log("Done zipping!");
}
exports.default = zip;
