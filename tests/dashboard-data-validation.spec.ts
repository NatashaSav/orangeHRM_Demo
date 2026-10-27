import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '../fixtures/authenticatedTest';
import { DASHBOARD_WIDGET_SCENARIOS } from '../data/constants';
import { DashboardPage } from '../pages/DashboardPage';

const missingWidgetTitles = readFileSync(
  join(__dirname, '../data/dashboard-missing-widgets.csv'),
  'utf8',
)
  .trim()
  .split(/\r?\n/)
  .slice(1)
  .map((title) => title.trim())
  .filter(Boolean);

test.describe('Dashboard Data Validation', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.open();
  });

  for (const scenario of DASHBOARD_WIDGET_SCENARIOS) {
    test(`Validates ${scenario.title}`, async () => {
      const widget = dashboardPage.getWidget(scenario.title);

      await widget.expectVisible();
      await widget.expectChartVisible();
      await widget.expectLabelVisible(scenario.visibleLabel);
      await widget.expectLabelAbsent(scenario.absentLabel);
    });
  }

  for (const title of missingWidgetTitles) {
    test(`Confirms ${title} is not present`, async () => {
      const widget = dashboardPage.getWidget(title);
      await widget.expectAbsent();
    });
  }
});
