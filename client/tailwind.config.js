/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brownshade': {
          100: '#E3DACE', // 100,200,500 used for bg gradient
          200: '#E1CDB1',
          500: '#AE887B',
          600: '#6B4E36', // button color
          700: '#E8D5BD', //modal bg color
          800: '#E1CDB1', //modal button fill 
          850: '#D4B896', //modal button border
          900: '#8D6F65' //Header color
        },
        'periwinkle': '#CCCCFF', //Team color
        'modalborder': '#3e3c3c',
        'modalbgfill': '#E8D5BD',
        'publishfill': '#7ACD65', // publish button
        'deletefill': '#CD6565',  // delete button
        'forkfill': '#E2E471',  // fork button
        'publishmodalsubtext': '#565656',
        'filebuttonfill': '#1973E8',
        'mapselectedfill': '#BCA17A',
        'dropdownhover': "#DDD",
        'lightgrey': "#686868", 
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

