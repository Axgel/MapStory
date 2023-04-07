/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brownshade': {
          100: '#E3DACE',
          200: '#E1CDB1',
          500: '#AE887B',
          600: '#6B4E36', 
          900: '#8D6F65' //Header color
        },
        'periwinkle': '#CCCCFF', //Team color
        'lightransparent': '#ffffff'
      },
      container: {
        center: true,
      },
      opacity: {
        '15': '0.15'
       }
    },
  },
  plugins: [],
}

