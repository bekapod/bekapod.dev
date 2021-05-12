const colors = require("tailwindcss/colors");
const { addUtilities } = require("tailwindcss");
const _ = require("lodash");

const returnColorMapping = function (createUtility, colors, prefix = null) {
  return _.flatMap(colors, (color, name) => {
    if (typeof color === "string" || color instanceof String) {
      let fullName = prefix ? `${prefix}-${name}` : name;

      return createUtility(fullName, color);
    } else {
      let newPrefix = prefix ? `${prefix}-${name}` : name;
      return returnColorMapping(createUtility, color, newPrefix);
    }
  });
};

module.exports = {
  mode: "jit",
  purge: ["./_site/**/*.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      sm: `${540 / 16}em`,
      md: `${768 / 16}em`,
      lg: `${980 / 16}em`,
      xl: `${1280 / 16}em`,
    },
    colors: {
      initial: "initial",
      inherit: "inherit",
      current: "currentColor",
      white: colors.white,
      "pink-vivid": {
        50: "#ffe3ec",
        100: "#ffb8d2",
        200: "#ff8cba",
        300: "#f364a2",
        400: "#e8368f",
        500: "#da127d",
        600: "#bc0a6f",
        700: "#a30664",
        800: "#870557",
        900: "#620042",
      },
      "cool-grey": {
        50: "#f5f7fa",
        100: "#e4e7eb",
        200: "#cbd2d9",
        300: "#9aa5b1",
        400: "#7b8794",
        500: "#616e7c",
        600: "#52606d",
        700: "#3e4c59",
        800: "#323f4b",
        900: "#1f2933",
      },
      "cyan-vivid": {
        50: "#e1fcf8",
        100: "#c1fef6",
        200: "#92fdf2",
        300: "#62f4eb",
        400: "#3ae7e1",
        500: "#1cd4d4",
        600: "#0fb5ba",
        700: "#099aa4",
        800: "#07818f",
        900: "#05606e",
      },
      "yellow-vivid": {
        50: "#fffbea",
        100: "#fff3c4",
        200: "#fce588",
        300: "#fadb5f",
        400: "#f7c948",
        500: "#f0b429",
        600: "#de911d",
        700: "#cb6e17",
        800: "#b44d12",
        900: "#8d2b0b",
      },
    },
    fontFamily: {
      display: ["bree", "sans-serif"],
      body: ["karmina-sans", "sans-serif"],
      "mono-display": ["dico-mono-script", "sans-serif"],
      mono: ["dico-mono", "sans-serif"],
    },
    fontSize: {
      sm: ["0.875rem", { lineHeight: "1.5rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      md: ["1.25rem", { lineHeight: "1.5rem" }],
      lg: ["1.5rem", { lineHeight: "1.5rem" }],
      xl: ["2.25rem", { lineHeight: "2.25rem" }],
      "2xl": ["3.375rem", { lineHeight: "3rem" }],
      "3xl": ["5.0625rem", { lineHeight: "6rem" }],
    },
    fontWeight: {
      thin: 200,
      light: 300,
      regular: 400,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      heavy: 900,
    },
    spacing: {
      px: "1px",
      0: 0,
      0.5: "calc(var(--baseline) * 0.0625rem)",
      1: "calc(var(--baseline) * 0.125rem)",
      2: "calc(var(--baseline) * 0.25rem)",
      3: "calc(var(--baseline) * 0.5rem)",
      4: "calc(var(--baseline) * 1rem)",
      4.5: "calc(var(--baseline) * 1.25rem)",
      4.75: "calc(var(--baseline) * 1.375rem)",
      5: "calc(var(--baseline) * 1.5rem)",
      6: "calc(var(--baseline) * 2rem)",
      7: "calc(var(--baseline) * 2.5rem)",
      8: "calc(var(--baseline) * 3rem)",
      9: "calc(var(--baseline) * 3.5rem)",
      10: "calc(var(--baseline) * 4rem)",
      11: "calc(var(--baseline) * 4.5rem)",
      12: "calc(var(--baseline) * 5rem)",
      13: "calc(var(--baseline) * 5.5rem)",
      14: "calc(var(--baseline) * 6rem)",
    },
    outline: {
      DEFAULT: ["3px dotted currentColor", "2px"],
      none: ["none"],
    },
    extend: {},
  },
  corePlugins: {
    container: false,
  },
  plugins: [
    ({ addUtilities, e, theme, variants }) => {
      const colors = theme("colors", {});
      const decorationVariants = variants("textDecoration", []);
      const createUtility = (fullName, color) => ({
        [`.decoration-color-${e(fullName)}`]: {
          textDecorationColor: `${color}`,
        },
      });
      const textDecorationColorUtility = returnColorMapping(createUtility, colors);

      addUtilities(textDecorationColorUtility, decorationVariants);
    },
    ({ addUtilities, e, theme, variants }) => {
      const colors = theme("colors", {});
      const decorationVariants = variants("highlightColor", []);
      const createUtility = (fullName, color) => ({
        [`.highlight-color-${e(fullName)}`]: {
          "--highlight-color": `${color}`,
        },
      });
      const highlightColorUtility = returnColorMapping(createUtility, colors);

      addUtilities(highlightColorUtility, decorationVariants);
    },
  ],
};
