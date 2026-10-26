import { type Download, type Locator, type Page, expect } from '@playwright/test';

export class AttachmentsPage {
  readonly page: Page;
  readonly attachmentsHeading: Locator;
  private readonly addButton: Locator;
  private readonly attachmentForm: Locator;
  private readonly fileInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.attachmentsHeading = page.getByRole('heading', {
      name: 'Attachments',
    });
    this.addButton = page.getByRole('button', { name: /Add/ });
    this.attachmentForm = page
      .locator('form')
      .filter({ has: page.getByPlaceholder('Type comment here') });
    this.fileInput = this.attachmentForm.locator('input[type="file"]');
    this.descriptionInput = this.attachmentForm.getByPlaceholder(
      'Type comment here',
    );
    this.saveButton = this.attachmentForm.getByRole('button', {
      name: 'Save',
    });
  }

  async open() {
    await this.page.getByRole('link', { name: 'My Info' }).click();
    await expect(this.attachmentsHeading).toBeVisible();
    await this.attachmentsHeading.scrollIntoViewIfNeeded();
  }

  getAttachmentRow(filename: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('cell', { name: filename, exact: true }),
    });
  }

  async uploadAttachment(
    filename: string,
    contents: string,
    description: string,
  ) {
    await this.addButton.click();
    await this.fileInput.setInputFiles({
      name: filename,
      mimeType: 'text/plain',
      buffer: Buffer.from(contents),
    });
    await this.descriptionInput.fill(description);

    const uploadResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/screen/personal/attachments') &&
        response.request().method() === 'POST',
    );
    await this.saveButton.click();
    const response = await uploadResponse;
    expect(response.ok()).toBeTruthy();

    await this.page.reload();
    await expect(this.attachmentsHeading).toBeVisible();
    await this.attachmentsHeading.scrollIntoViewIfNeeded();
    await expect(this.getAttachmentRow(filename)).toBeVisible();
  }

  async downloadAttachment(filename: string): Promise<Download> {
    const row = this.getAttachmentRow(filename);
    const downloadButton = row
      .getByRole('button')
      .filter({ has: this.page.locator('i.bi-download') });

    const downloadPromise = this.page.waitForEvent('download');
    await downloadButton.click();
    return downloadPromise;
  }

  async deleteAttachment(filename: string) {
    const row = this.getAttachmentRow(filename);
    const deleteButton = row
      .getByRole('button')
      .filter({ has: this.page.locator('i.bi-trash') });

    await deleteButton.click();
    await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
    await expect(row).toHaveCount(0);
  }

  async deleteAttachmentIfExists(filename: string) {
    await this.open();

    const row = this.getAttachmentRow(filename);
    if (await row.count()) {
      await this.deleteAttachment(filename);
    }
  }
}
