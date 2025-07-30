const {merge} = require("webpack-merge");
const common = require("./webpack.common.js");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "public",
                    to: ".",
                    globOptions: {
                        ignore: ["**/index.html"] // HtmlWebpackPlugin handles this
                    }
                }
            ]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    ecma: 2020,
                    compress: {
                        passes: 3,
                        pure_getters: true,
                        unsafe: true,
                        unsafe_arrows: true,
                        unsafe_methods: true,
                        module: true,
                        toplevel: true
                    },
                    mangle: {
                        toplevel: true
                    },
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ],
        splitChunks: {
            chunks: "all"
        },
        usedExports: true,
        sideEffects: true
    }
});
