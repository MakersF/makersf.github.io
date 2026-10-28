const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  use: { baseURL: 'http://127.0.0.1:4000', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'bundle exec ruby -run -e httpd _site -p 4000 -b 127.0.0.1',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: false,
  },
});
