import zip from "./zip";

const replace = require('replace-in-file');

(async () => {
    try {
        console.log("Converting to Chrome...")
        const options = {
            files: "./src/**",
            from: /moz-extension/g,
            to: "chrome-extension",
        }
        const results = await replace(options)
        console.log("Conversion results:", results)
        zip("Chrome-2.0.0")
    } catch (error) {
        console.error("Error occurred:", error)
    }
})()