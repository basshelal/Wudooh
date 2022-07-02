import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "..", "src");

export default {
    entry: {
        common: path.join(srcDir, "common.ts"),
        background: path.join(srcDir, "background.ts"),
        popup: path.join(srcDir, "popup.ts"),
        custom_fonts: path.join(srcDir, "custom_fonts.ts"),
        main: path.join(srcDir, "main.ts"),
    },
    output: {
        path: path.join(__dirname, "../dist/js"),
        filename: "[name].js",
    },
    optimization: {
        minimize: false,
        // splitChunks: {
        //     name: "vendor",
        //     chunks(chunk) {
        //         return chunk.name !== 'background';
        //     }
        // },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{from: ".", to: "../", context: "public"}],
            options: {},
        }),
    ],
};
