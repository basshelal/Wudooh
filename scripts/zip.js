"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const czip = require("cross-zip");
function zip(outName) {
    const srcPath = path.join(__dirname, "../src");
    const tmpPath = path.join(__dirname, "./tmp");
    const outZipPath = path.join(__dirname, `../dist/${outName}.zip`);
    console.log(`Zipping src ${srcPath} to ${outZipPath}`);
    const srcScripts = ["background", "custom_fonts", "main", "popup", "shared"];
    const excludedFiles = [];
    srcScripts.forEach(fileName => {
        excludedFiles.push(`${tmpPath}/${fileName}.ts`);
        excludedFiles.push(`${tmpPath}/${fileName}.js`);
    });
    fs.copySync(srcPath, tmpPath);
    excludedFiles.forEach(file => {
        fs.removeSync(file);
        console.log(`Excluding ${file}`);
    });
    console.log(`Zipping to ${outZipPath}`);
    czip.zipSync(tmpPath, outZipPath);
    console.log(`Removing tmp ${tmpPath}`);
    fs.removeSync(tmpPath);
    console.log("Done zipping!");
}
exports.default = zip;
