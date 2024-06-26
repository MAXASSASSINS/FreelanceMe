/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{js,css}",
    "./views/**/*.ejs",
    "./node_modules/tw-elements/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        dark_grey: "#222831",
        light_grey: "#393e46",
        primary: "#1dbf73",
        off_white: "#EEEEEE",
        no_focus: "#a6a5a5",
        icons: "#74767e",
        gold: "#ffbe5b",
        border: "#F1EEE9",
        separator: "#efeff0",
        light_heading: "#62646a",
        dark_separator: "#e4e5e7",
        light_background: "#d5d4d2",
        link: "#4a73e8",
        warning: "#f74040",
        error: "#f74040",
        primary_hover: "#19a463",
        warning_background_color: "#ffeded",
        green_background_color: "#d5f6d7",
      },
      borderWidth: {
        1: "1px",
      },
      screens: {
        sm: "600px",
      }
    },
  },
  plugins: [],
}