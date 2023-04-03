const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://map-story-beta.vercel.app/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});