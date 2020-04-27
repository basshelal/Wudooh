// Find all instances of "chrome-extension" across all files and replace them with "moz-extension"

const replace = require('replace-in-file');
const options = {
    files: "../src/*",
    from: /chrome-extension/g,
    to: "moz-extension",
};