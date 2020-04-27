import zip from "./zip";

const replace = require("replace-in-file");

(async () => {
    try {
        console.log("Converting to Firefox...")
        const options = {
            files: "./src/**",
            from: /chrome-extension/g,
            to: "moz-extension",
        }
        const results = await replace(options)
        console.log("Conversion results:", results)
        zip("Firefox-2.0.0")
    } catch (error) {
        console.error("Error occurred:", error)
    }
})()