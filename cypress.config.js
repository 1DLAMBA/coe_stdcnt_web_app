const { defineConfig } = require('cypress');

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: [
      'cypress/e2e/1-getting-started/**',
      'cypress/e2e/2-advanced-examples/**',
    ],

    setupNodeEvents(on, config) {
      config.env.apiBaseUrl =
        process.env.CYPRESS_API_BASE_URL || 'http://127.0.0.1:8000/api';
      return config;
    },
  },

  env: {
    apiBaseUrl: 'http://127.0.0.1:8000/api',
  },

  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
});
