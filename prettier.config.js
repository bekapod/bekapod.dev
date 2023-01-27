module.exports = {
  singleQuote: true,
  semi: false,
  plugins: [
    require('prettier-plugin-tailwindcss'),
    require('prettier-plugin-go-template'),
  ],
  overrides: [
    {
      files: ['*.html'],
      options: {
        parser: 'go-template',
      },
    },
  ],
}
