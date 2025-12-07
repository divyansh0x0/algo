export default {
    content: [
        './components/**/*.{vue,js,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './app.vue',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
                    1: 'rgb(var(--surface-1) / <alpha-value>)',
                },
                fg: 'rgb(var(--fg) / <alpha-value>)',
            },
        },
    },
}
