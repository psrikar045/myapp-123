# Frontend Testing Guide

This document provides a comprehensive guide to the end-to-end (E2E) testing setup for this project, using Playwright.

## Table of Contents

- [Folder Structure](#folder-structure)
- [Running Tests](#running-tests)
- [Debugging Tests](#debugging-tests)
- [Mocking](#mocking)
- [Test Data](#test-data)
- [Versioning and Upgrade Strategy](#versioning-and-upgrade-strategy)
- [CI/CD](#cicd)

## Folder Structure

- `e2e/`: Contains all Playwright test files (`.spec.ts`).
- `mocks/`: Contains mock handlers for API endpoints.
- `test-data/`: Contains test data fixtures and seeding/reset scripts.

## Running Tests

We have several npm scripts to run the E2E tests in different modes:

- `npm run test:e2e`: Runs all tests in headless mode.
- `npm run test:e2e:dev`: Runs tests in headed mode for local development.
- `npm run test:e2e:debug`: Runs tests in debug mode, allowing you to step through the test execution.
- `npm run test:e2e:ci`: Runs tests in a CI environment.

## Debugging Tests

Playwright provides several ways to debug your tests:

- **Playwright Inspector:** Run your tests with `PWDEBUG=1` to open the Playwright Inspector, which allows you to step through your tests and see what Playwright is doing.
- **`page.pause()`:** Add `await page.pause()` to your test to pause the execution and inspect the page in the browser.

## Mocking

We use Mock Service Worker (MSW) to mock API responses. The mock handlers are located in the `mocks/` directory. To run tests with mocked APIs, use the `test:e2e:mock` script.

## Test Data

We have a strategy for seeding and resetting test data. The scripts are located in the `test-data/` directory.

- `npm run test:data:seed`: Seeds the database with test data.
- `npm run test:data:reset`: Resets the database to its initial state.

## Versioning and Upgrade Strategy

We have pinned the Playwright version in `package.json` to ensure consistency across environments.

### Upgrade Cadence

We recommend upgrading Playwright every 3 months to stay up-to-date with the latest features and bug fixes.

### Upgrade Checklist

1.  Read the Playwright release notes to understand the changes.
2.  Update the Playwright version in `package.json`.
3.  Run `npm install` to install the new version.
4.  Run all E2E tests to ensure that there are no regressions.
5.  Update the `TESTING.md` file with any changes to the testing setup.

## CI/CD

We have a GitHub Actions workflow for running the E2E tests. The workflow is located in `.github/workflows/e2e.yml`.
