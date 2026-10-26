import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures/authenticatedTest';
import { AttachmentsPage } from '../pages/AttachmentsPage';

test.describe('My Info Attachments', () => {
  let filename: string | undefined;

  test.afterEach(async ({ authenticatedPage }) => {
    if (filename) {
      const attachmentsPage = new AttachmentsPage(authenticatedPage);
      await attachmentsPage.deleteAttachmentIfExists(filename);
      filename = undefined;
    }
  });

  test('Uploads, downloads and deletes an attachment', async ({ authenticatedPage }) => {
    const attachmentsPage = new AttachmentsPage(authenticatedPage);
    filename = `playwright-attachment-${Date.now()}.txt`;
    const contents = `Attachment verification: ${filename}`;
    const description = 'Playwright attachment test';

    await attachmentsPage.open();
    await attachmentsPage.uploadAttachment(
      filename,
      contents,
      description,
    );

    const attachmentRow = attachmentsPage.getAttachmentRow(filename);
    await expect(attachmentRow).toContainText(description);

    const download = await attachmentsPage.downloadAttachment(filename);
    expect(download.suggestedFilename()).toBe(filename);
    expect(await readFile(await download.path(), 'utf8')).toBe(contents);

    await attachmentsPage.deleteAttachment(filename);
    filename = undefined;
  });
});
