const coordinator = {
  id: 2,
  name: 'Amina Coordinator',
  email: 'amina@centre.test',
  role: 'centre_coordinator',
  study_centre: 'Mokwa',
  is_active: true,
  permissions: [
    'students.view',
    'students.manage',
    'graduation.view',
    'graduation.upload',
    'clearance.view',
    'clearance.start',
  ],
};

const bursar = {
  id: 1,
  name: 'College Bursar',
  email: 'bursar@college.test',
  role: 'bursar',
  study_centre: null,
  is_active: true,
  permissions: [
    'students.view',
    'students.manage',
    'applications.view',
    'applications.manage',
    'graduation.view',
    'graduation.upload',
    'clearance.view',
    'clearance.start',
    'clearance.approve',
    'staff.manage',
    'stats.view',
  ],
};

async function mockStaffLogin(page, user) {
  await page.route('**/api/staff/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'test-token', user }),
    });
  });
  await page.route('**/api/staff/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Logged out.' }),
    });
  });
}

async function signIn(page, user) {
  await mockStaffLogin(page, user);
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill('password12');
  await page.getByTestId('staff-signin').click();
  await page.getByTestId('staff-home').waitFor();
}

module.exports = { coordinator, bursar, mockStaffLogin, signIn };
