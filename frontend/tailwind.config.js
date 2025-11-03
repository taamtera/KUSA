/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx,mdx}",
        "./components/**/*.{js,jsx,ts,tsx,mdx}",
        "./hooks/**/*.{js,jsx,ts,tsx}",
        "./context/**/*.{js,jsx,ts,tsx}",
        "./lib/**/*.{js,jsx,ts,tsx}",
        "./providers.js",
        "./middleware.js", // optional; only if you ever put classes here
    ],
    theme: {
        extend: {
            keyframes: {
                overlayShow: {
                    from: { opacity: "0" },
                    to:   { opacity: "1" },
                },
                contentShow: {
                    from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
                    to:   { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
                },
                overlayHide: {
                    from: { opacity: "1" },
                    to:   { opacity: "0" },
                },
                contentHide: {
                    from: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
                    to:   { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
                },
            },
            animation: {
                overlayShow:  "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                contentShow:  "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                overlayHide:  "overlayHide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                contentHide:  "contentHide 150ms cubic-bezier(0.16, 1, 0.3, 1)",
            },
        },
    },
    plugins: [],
};
