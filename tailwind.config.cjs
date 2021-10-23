const colors = require('tailwindcss/colors.js');

const config = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: 'media',

  theme: {
    extend: {
      colors: {
        coolGray: colors.coolGray,
      }
    }
  },

  plugins: []
};

module.exports = config;