// Build order matters:
//   1. Tailwind emits modern CSS (oklch colors, color-mix, etc.)
//   2. postcss-oklab-function rewrites every oklch()/oklab() into a
//      preserved-fallback pair — flat rgb() first for old browsers,
//      original oklch() second for wide-gamut modern ones.
//   3. autoprefixer adds -webkit-/-moz- prefixes per the browserslist
//      in package.json.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "@csstools/postcss-oklab-function": { preserve: true },
    autoprefixer: {},
  },
};

export default config;
