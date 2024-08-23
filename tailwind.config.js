// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        screens: {
            mobile: { max: '820px' },
            xs: { max: '640px' },
            xxs: { max: '370px' },
        },
        colors: { ...colors,
            'primary': {
                '50': '#fcfef1',
                '100': '#eef3db',
                '200': '#d8dbbe',
                '300': '#599ca1',
                '400': '#5f5e5b',
            }
        },
        extend: {},
    },
    plugins: [],
};
