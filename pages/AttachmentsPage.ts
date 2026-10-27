import { type Download, type Locator, type Page, expect } from '@playwright/test';
import {
  ACCESSIBILITY_ROLES,
  HTTP_METHODS,
  UI_LABELS,
  URLS,
} from '../data/constants';
import { SideNavigation } from './SideNavigation';

export class AttachmentsPage {
  readonly page: Page;
  readonly attachmentsHeading: Locator;
  private readonly addButton: Locator;
  private readonly attachmentForm: Locator;
  private readonly fileInput: Locator;
  private readonly descriptionInput: Locator;
  private readonly saveButton: Locator;
  private readonly sideNavigation: SideNavigation;
  private readonly rows: Locator;
  private readonly deleteConfirmationButton: Locator;
  private readonly downloadIcon: Locator;
  private readonly deleteIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.attachmentsHeading = page.getByRole(ACCESSIBILITY_ROLES.heading, {
      name: UI_LABELS.attachments,
    });
    this.addButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: new RegExp(UI_LABELS.add),
    });
    this.attachmentForm = page
      .locator('form')
      .filter({
        has: page.getByPlaceholder(UI_LABELS.attachmentDescriptionPlaceholder),
      });
    this.fileInput = this.attachmentForm.locator('input[type="file"]');
    this.descriptionInput = this.attachmentForm.getByPlaceholder(
      UI_LABELS.attachmentDescriptionPlaceholder,
    );
    this.saveButton = this.attachmentForm.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.save,
    });
    this.sideNavigation = new SideNavigation(page);
    this.rows = page.getByRole(ACCESSIBILITY_ROLES.row);
    this.deleteConfirmationButton = page.getByRole(ACCESSIBILITY_ROLES.button, {
      name: UI_LABELS.deleteConfirmation,
    });
    this.downloadIcon = page.locator('i.bi-download');
    this.deleteIcon = page.locator('i.bi-trash');
  }

  async open() {
    await this.sideNavigation.openMyInfo();
    await expect(this.attachmentsHeading).toBeVisible();
    await this.attachmentsHeading.scrollIntoViewIfNeeded();
  }

  getAttachmentRow(filename: string): Locator {
    return this.rows.filter({
      has: this.page.getByRole(ACCESSIBILITY_ROLES.cell, {
        name: filename,
        exact: true,
      }),
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
        response.url().includes(URLS.employeeAttachments) &&
        response.request().method() === HTTP_METHODS.post,
    );
    await this.saveButton.click();
    const response = await uploadResponse;
    expect(response.ok()).toBeTruthy();

    await expect(this.getAttachmentRow(filename)).toBeVisible();
  }

  async downloadAttachment(filename: string): Promise<Download> {
    const row = this.getAttachmentRow(filename);
    const downloadButton = row
      .getByRole(ACCESSIBILITY_ROLES.button)
      .filter({ has: this.downloadIcon });

    const downloadPromise = this.page.waitForEvent('download');
    await downloadButton.click();
    return downloadPromise;
  }

  async deleteAttachment(filename: string) {
    const row = this.getAttachmentRow(filename);
    const deleteButton = row
      .getByRole(ACCESSIBILITY_ROLES.button)
      .filter({ has: this.deleteIcon });

    await deleteButton.click();
    await this.deleteConfirmationButton.click();
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
