const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: false, 
  trashAssetsBeforeRuns: true,
  e2e: {
    baseUrl: 'http://localhost:3000/',
    supportFile: false,
    specPattern: [
      './cypress/e2e/*.cy.js'
    ]
  },
});