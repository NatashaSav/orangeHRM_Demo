import { test, expect } from '../fixtures/authenticatedTest';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Dashboard Data Validation', () => {
  test('Validates employee distribution charts', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.open();

    const subUnitWidget = dashboardPage.getChartWidget(
      'Employee Distribution by Sub Unit',
    );
    const locationWidget = dashboardPage.getChartWidget(
      'Employee Distribution by Location',
    );

    await expect(subUnitWidget.locator('canvas')).toBeVisible();
    await expect(subUnitWidget.getByText('Engineering', { exact: true }))
      .toBeVisible();
    await expect(subUnitWidget.getByText('Texas R&D', { exact: true }))
      .toHaveCount(0);

    await expect(locationWidget.locator('canvas')).toBeVisible();
    await expect(locationWidget.getByText('Texas R&D', { exact: true }))
      .toBeVisible();
    await expect(locationWidget.getByText('Engineering', { exact: true }))
      .toHaveCount(0);
  });
});
