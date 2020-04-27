// Find all instances of "chrome-extension" across all files and replace them with "moz-extension"
var replace = require('replace-in-file');
var options = {
    files: "../src/*",
    from: /chrome-extension/g,
    to: "moz-extension",
};
