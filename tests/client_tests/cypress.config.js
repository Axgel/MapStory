const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  trashAssetsBeforeRuns: true,
  e2e: {
    baseUrl: 'http://localhost:3000/',
    supportFile: './cypress/support/e2e.js',
    experimentalSessionAndOrigin: true,
    specPattern: [
      './cypress/e2e/Account_management/*.cy.js',
      './cypress/e2e/*.cy.js'
    ]
  },
});