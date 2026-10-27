import { test } from '../fixtures/authenticatedTest';
import { VacanciesPage } from '../pages/VacanciesPage';
import { UI_LABELS, VACANCY_STATUSES } from '../data/constants';

test.describe('Recruitment Vacancies', () => {
  test('filters vacancies by job title', async ({ authenticatedPage }) => {
    const vacanciesPage = new VacanciesPage(authenticatedPage);
    await vacanciesPage.open();
    await vacanciesPage.search();
    const jobTitle = await vacanciesPage.getActiveVacancyJobTitle();
    await vacanciesPage.selectFilter(UI_LABELS.jobTitle, jobTitle);
    await vacanciesPage.search();

    await vacanciesPage.expectAllResultRowsToContainCellText(jobTitle);
  });

  test('filters vacancies by status', async ({ authenticatedPage }) => {
    const vacanciesPage = new VacanciesPage(authenticatedPage);
    await vacanciesPage.open();
    await vacanciesPage.selectFilter(
      UI_LABELS.status,
      VACANCY_STATUSES.active,
    );
    await vacanciesPage.search();

    await vacanciesPage.expectAllResultRowsToContainCellText(
      VACANCY_STATUSES.active,
    );
  });
});
