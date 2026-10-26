# OrangeHRM Demo Site E2E Tests

Automated end-to-end tests for the public OrangeHRM demo application, built
with Playwright, TypeScript, and the Page Object Model (POM).

## Prerequisites

- A supported desktop OS: macOS, Windows, or Linux
- Node.js 20 or newer (npm is included with Node.js)
- Git, if you plan to clone the project (alternatively, download and extract
  the project ZIP)
- Internet access to download packages and browser binaries and to reach the
  OrangeHRM application

### Install Node.js and Git

Install the current Node.js LTS release (20 or newer) from
[nodejs.org](https://nodejs.org/en/download/). The standard installer includes
npm. Close and reopen your terminal after installation, then verify both are
available:

```bash
node --version
npm --version
```

Install Git from [git-scm.com](https://git-scm.com/downloads) if it is not
already installed. On macOS, Git can also be installed with Apple's Command
Line Tools by running `xcode-select --install`.

### Get the project files

If you have the repository URL and Git installed:

```bash
git clone <repository-url>
cd <repository-folder>
```

Replace the placeholders with the repository URL and folder name. If you
received the project as a ZIP, extract it and open a terminal in the extracted
project folder instead.

## Setup

Run these commands from the project root:

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

On Linux, install Chromium and its required system packages with:

```bash
npx playwright install --with-deps chromium
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

On macOS and Linux, `cp .env.example .env` creates the same local environment
file. If you do not need custom settings, the copy can be skipped: the project
uses the demo URL and public demo credentials as defaults.

Review `.env` and set the application URL and account credentials for your
environment:

```dotenv
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
```

The values above are the publicly displayed demo account defaults, not
production credentials. The public demo is shared, and its credentials or data
may change. For another OrangeHRM instance, use an account with the required
Admin permissions. Keep real credentials in the ignored `.env` file or in your
CI secret store; do not commit them. `.env.example` is the safe template to
include in version control.

## Running the tests

Run the complete suite:

```bash
npm test
```

Run an individual scenario:

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/user-management.spec.ts
npx playwright test tests/my-info-attachments.spec.ts
npx playwright test tests/dashboard-data-validation.spec.ts
npx playwright test tests/recruitment-vacancies.spec.ts
```

Run tests with a visible browser or the Playwright UI:

```bash
npm run test:headed
npm run test:ui
```

Check TypeScript and open the HTML report:

```bash
npm run typecheck
npm run report
```

The first test run may take longer while Playwright starts Chromium. If the
browser binary is missing later, run `npx playwright install chromium` again.

Playwright runs tests with one worker because the public demo is shared and
mutable. This reduces interference between tests that create, update, or delete
records.

## Project structure

```text
data/       Credentials and expected user-facing messages
fixtures/   Shared authenticated Playwright fixture
pages/      Page Objects and page-specific interactions
tests/      Login, user management, attachments, dashboard, and vacancies specs
types/      Shared TypeScript interfaces
utils/      Test data generation and reusable helpers
```

## Test coverage and approach

- **Login:** successful login, invalid credentials, and required-field
  validation.
- **User management:** creates a uniquely named user, verifies the account,
  changes its status, confirms the change, and deletes the user. A cleanup hook
  also removes the created account if the test fails partway through.
- **My Info attachments:** uploads a generated text file with a description,
  verifies the listing, downloads and checks its contents, then deletes it.
  Cleanup runs after failures as well.
- **Dashboard:** verifies the Employee Distribution by Sub Unit and Employee
  Distribution by Location chart widgets, including labels that must not appear
  in the opposite chart.
- **Recruitment vacancies:** filters by job title and status, then verifies
  matching results and the absence of non-matching results.

Page Objects keep selectors and page actions out of test bodies. Shared login
setup is provided by `fixtures/authenticatedTest.ts`. Dynamic test usernames
and attachment filenames prevent collisions between runs. The user-management
flow selects an active employee that does not already have a system account.

## Assumptions and limitations

- The default data and test assertions target the current OrangeHRM demo
  dataset. Labels and available vacancies can change, so update the relevant
  assertions if the demo data changes.
- The public demo may be slow, rate-limited, or temporarily unavailable. It is
  shared with other users, and other activity can affect its data.
- Tests use the OrangeHRM web interface and its authenticated API responses for
  synchronization and finding an available employee. They do not access the
  application's database.
- Chromium is configured as the browser project. Additional browsers can be
  added in `playwright.config.ts`.
