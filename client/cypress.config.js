const { defineConfig } = require("cypress");

module.exports = defineConfig({
  fixturesFolder: '../tests/client_tests/cypress/fixtures',
  video: false,
  e2e: {
    baseUrl: 'https://map-story-beta.vercel.app/',
    supportFile: '../tests/client_tests/cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: [
      '../tests/client_tests/cypress/e2e/SplashScreen.cy.js'
    ]
  },
});