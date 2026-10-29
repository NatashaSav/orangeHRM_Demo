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

Run these commands from the project root in a Bash-compatible terminal
(Bash, Zsh, or Git Bash):

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

On Linux, install Chromium and its required system packages with:

```bash
npx playwright install --with-deps chromium
```

In Windows PowerShell, use the equivalent command:

```powershell
Copy-Item .env.example .env
```

In Windows Command Prompt (CMD), use the equivalent command:

```cmd
copy .env.example .env
```

These commands create the local `.env` file from the template. Configure the
account credentials there before running tests. The tests do not provide
default credentials.

Set the application URL and account credentials in `.env`. Replace the
placeholders with the credentials for the OrangeHRM instance you are testing:

```dotenv
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
```

The public demo is shared, so its credentials or data may change. For another
OrangeHRM instance, use an account with the required Admin permissions. Keep
credentials only in the ignored `.env` file. Do not commit them.
`.env.example` contains placeholders and is safe to include in version control.

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

Run tests in a visible browser window:

```bash
npm run test:headed
```

`test:headed` runs the suite in a visible Chromium window.

Run the interactive test runner:

```bash
npm run test:ui
```

`test:ui` opens Playwright UI Mode, where you can select tests and inspect
steps, traces, and errors.

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
api/        API clients for employee and system user data
data/       Credentials, constants, expected messages, and dashboard CSV test data
fixtures/   Shared authenticated Playwright fixture
pages/      Page Objects, dashboard widgets, shared side navigation, and page interactions
tests/      Login, user management, attachments, dashboard, and vacancies specs
types/      Shared TypeScript interfaces
utils/      Test data generation and reusable helpers
```

## Test coverage and approach

- **Login:** successful login, invalid credentials, and required-field
  validation.
- **User management:** separate tests create a uniquely named user, edit its
  status, and delete it. Each test creates its own account; a cleanup hook
  removes it even if the test fails partway through.
- **My Info attachments:** uploads a generated text file with a description,
  verifies the listing, downloads and checks its contents, then deletes it.
  Cleanup runs after failures as well.
- **Dashboard:** verifies the Employee Distribution by Sub Unit and Employee
  Distribution by Location chart widgets, including labels that must not appear
  in the opposite chart. Data-driven negative scenarios use
  `data/dashboard-missing-widgets.csv` to verify configured widget titles are
  absent.
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
