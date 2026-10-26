import { test, expect } from '../fixtures/authenticatedTest';
import { VacanciesPage } from '../pages/VacanciesPage';

test.describe('Recruitment Vacancies', () => {
  test('filters vacancies by job title and status', async ({ authenticatedPage }) => {
    const vacanciesPage = new VacanciesPage(authenticatedPage);
    await vacanciesPage.open();
    const jobTitle = await vacanciesPage.getActiveVacancyJobTitle();
    await vacanciesPage.selectFilter('Job Title', jobTitle);
    await vacanciesPage.selectFilter('Status', 'Active');
    await vacanciesPage.search();

    const matchingVacancies = vacanciesPage.getRowsByCellText(jobTitle);
    await expect(matchingVacancies).not.toHaveCount(0);
    await expect(
      matchingVacancies.filter({
        has: authenticatedPage.getByRole('cell', {
          name: 'Active',
          exact: true,
        }),
      }),
    ).not.toHaveCount(0);
    await expect(vacanciesPage.getRowsByCellText('Closed')).toHaveCount(0);
  });
});
