const { test, expect } = require('@playwright/test');
const { coordinator, bursar, signIn } = require('./staffHelpers');

test.describe('Staff portal', () => {
  test('home page sends staff to email login, not the old passkey', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Staff login' }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
    await expect(page.getByText('Students should go back')).toBeVisible();
  });

  test('/student and /admin without a session go to staff sign in', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('empty sign-in stays on the form', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByTestId('staff-signin').click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
  });

  test('coordinator sees numbered centre steps and not bursar tools', async ({ page }) => {
    await signIn(page, coordinator);

    await expect(page.getByTestId('staff-role')).toContainText('Mokwa coordinator');
    await expect(page.getByText('Follow the numbered steps')).toBeVisible();
    await expect(page.getByText('Step 1')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upload the graduation list' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add anyone missing from the portal' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Start clearance for them' })).toBeVisible();

    await expect(page.getByTestId('staff-nav-students')).toHaveText('My students');
    await expect(page.getByTestId('staff-nav-clearance')).toHaveText('Centre clearance');
    await expect(page.getByTestId('staff-nav-applications')).toHaveCount(0);
    await expect(page.getByTestId('staff-nav-staff')).toHaveCount(0);
    await expect(page.getByTestId('staff-nav-reports')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Staff logins' })).toHaveCount(0);
  });

  test('coordinator home opens graduation list as the first action', async ({ page }) => {
    await signIn(page, coordinator);
    await page.route('**/api/graduation-list**', async (route) => {
      const url = route.request().url();
      if (url.includes('/unmatched')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ total: 0, matched: 0, unmatched: 0, unmatched_rows: [] }),
        });
        return;
      }
      if (url.includes('/check/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ on_list: false, entry: null }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], current_page: 1, per_page: 20, total: 0 }),
      });
    });
    await page.getByRole('button', { name: 'Open graduation list' }).click();
    await expect(page).toHaveURL(/\/admin\/graduation-list/);
    await expect(page.getByRole('heading', { name: /Graduation list/i })).toBeVisible();
    await expect(page.getByText('Scoped to Mokwa')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add one student' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: '* Matric number' })).toBeVisible();
  });

  test('bursar sees college-wide tasks including approval and staff logins', async ({ page }) => {
    await signIn(page, bursar);

    await expect(page.getByTestId('staff-role')).toContainText('bursar');
    await expect(page.getByRole('heading', { name: 'Approve clearance' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Staff logins' })).toBeVisible();
    await expect(page.getByTestId('staff-nav-applications')).toHaveText('New applications');
    await expect(page.getByTestId('staff-nav-staff')).toHaveText('Staff logins');
    await expect(page.getByTestId('staff-nav-reports')).toHaveText('Reports');
    await expect(page.getByText('Step 1')).toHaveCount(0);
  });
});
