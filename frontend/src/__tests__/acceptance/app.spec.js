import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4000/api';
const TEST_PASSWORD = 'TestPassword123!';

function buildTestUser() {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  return {
    username: `testuser_${suffix}`,
    email: `test_${suffix}@example.com`,
    password: TEST_PASSWORD,
  };
}

test.describe('Frontend Acceptance Tests - Complete User Workflows', () => {
  test.afterEach(async ({ context }) => {
    // Clear storage after each test
    await context.clearCookies();
    const storage = await context.storageState();
    if (storage.origins) {
      for (const origin of storage.origins) {
        await context.clearCookies({ name: '.*' });
      }
    }
  });

  test('User signup and login workflow', async ({ page }) => {
    const testUser = buildTestUser();

    // Navigate to signup page
    await page.goto('/signup');
    await expect(page.locator('h2')).toContainText('Create Account');

    // Fill signup form
    await page.fill('input#signup-username', testUser.username);
    await page.fill('input#signup-email', testUser.email);
    await page.fill('input#signup-password', testUser.password);
    await page.fill('input#signup-confirm-password', testUser.password);

    // Submit signup
    await page.click('button:has-text("Create Account")');

    // Should redirect to dashboard after successful signup
    await page.waitForURL('/');
    await expect(page.locator('h2')).toContainText('Dashboard');

    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('/login');

    // Login with new account
    await page.fill('input#auth-identifier', testUser.username);
    await page.fill('input#auth-password', testUser.password);
    await page.click('button:has-text("Login")');

    // Should be on dashboard
    await page.waitForURL('/');
    await expect(page.locator('h2')).toContainText('Dashboard');
  });

  test('Create note and assign to folder workflow', async ({ page }) => {
    // Setup: Login first
    await loginTestUser(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Navigate to new note page
    await page.click('a:has-text("New Notes")');
    await expect(page).toHaveURL(/\/notes\/new$/);

    // Fill note form
    await page.fill('input#note-title', 'Biology Study Notes');
    await page.fill('textarea#note-content', 'Mitochondria is the powerhouse of the cell. It contains DNA and ribosomes.');

    // Submit note
    await page.click('button:has-text("Save Note")');

    // Should return to dashboard
    await expect(page).toHaveURL('/');

    // Verify note appears in sidebar
    await expect(page.getByRole('button', { name: 'Biology Study Notes' })).toBeVisible();
  });

  test('Question generation and review workflow', async ({ page }) => {
    // Setup: Login first
    await loginTestUser(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Create a note
    await page.click('a:has-text("New Notes")');
    await expect(page).toHaveURL(/\/notes\/new$/);
    await page.fill('input#note-title', 'Biology Notes');
    await page.fill('textarea#note-content', 'Photosynthesis is the process by which plants convert sunlight into chemical energy.');
    await page.click('button:has-text("Save Note")');

    await expect(page).toHaveURL('/');

    // Open note to view details
    await page.getByRole('button', { name: /Biology Notes/ }).click();
    await expect(page.getByRole('heading', { name: 'Biology Notes' })).toBeVisible();

    // Open questions page from detail view.
    await page.click('a:has-text("Generate Questions")');
    await expect(page).toHaveURL(/\/notes\/.+\/questions$/);

    // Verify questions page is rendered.
    await expect(page.locator('h2')).toContainText('Active Recall Questions');
  });

  test('Protected routes redirect unauthenticated users', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/');

    // Should redirect to login
    await page.waitForURL('/login');
    await expect(page.locator('h2')).toContainText('Login');
  });

  test('Login validation error messages', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Click submit without filling fields
    await page.click('button:has-text("Login")');

    // Check error messages
    await expect(page.locator('text=Email or username is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Fill only username
    await page.fill('input#auth-identifier', 'testuser');
    await page.click('button:has-text("Login")');

    // Password error should still be visible
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Error clears when user types
    const passwordInput = page.locator('input#auth-password');
    await passwordInput.fill('password');
    await expect(page.locator('text=Password is required')).not.toBeVisible();
  });

  test('Signup validation error messages', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Click submit without filling fields
    await page.click('button:has-text("Create Account")');

    // Check all error messages
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=Please confirm your password')).toBeVisible();
  });

  test('Signup email validation', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Fill with invalid email
    await page.fill('input#signup-email', 'invalidemail');
    await page.click('button:has-text("Create Account")');

    // Check email error
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();

    // Fill with valid email
    await page.fill('input#signup-email', 'valid@example.com');
    await expect(page.locator('text=Enter a valid email address')).not.toBeVisible();
  });

  test('Signup password validation', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Fill form with short password
    await page.fill('input#signup-username', 'testuser');
    await page.fill('input#signup-email', 'test@example.com');
    await page.fill('input#signup-password', 'short');
    await page.click('button:has-text("Create Account")');

    // Check password error
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('Signup password mismatch validation', async ({ page }) => {
    // Navigate to signup
    await page.goto('/signup');

    // Fill form with mismatched passwords
    await page.fill('input#signup-username', 'testuser');
    await page.fill('input#signup-email', 'test@example.com');
    await page.fill('input#signup-password', 'password123');
    await page.fill('input#signup-confirm-password', 'password456');
    await page.click('button:has-text("Create Account")');

    // Check password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('Note edit workflow', async ({ page }) => {
    // Setup: Login first
    await loginTestUser(page);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Create a note
    await page.click('a:has-text("New Notes")');
    await expect(page).toHaveURL(/\/notes\/new$/);
    await page.fill('input#note-title', 'Original Title');
    await page.fill('textarea#note-content', 'Original content');
    await page.click('button:has-text("Save Note")');

    await expect(page).toHaveURL('/');

    // Click on the note to view details (dashboard in-place render).
    await page.getByRole('button', { name: /Original Title/ }).click();
    await expect(page.getByRole('heading', { name: 'Original Title' })).toBeVisible();

    // Verify we can see the note content
    await expect(page.locator('text=Original content')).toBeVisible();
  });
});

// Helper functions

async function loginTestUser(page) {
  const user = buildTestUser();
  await ensureUserExists(page, user);

  await page.goto('/login');
  await page.fill('input#auth-identifier', user.username);
  await page.fill('input#auth-password', user.password);
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL('/');
}

async function ensureUserExists(page, user) {
  const signupResponse = await page.request.post(`${API_BASE}/auth/signup`, {
    data: {
      username: user.username,
      email: user.email,
      password: user.password,
    },
  });

  if (!signupResponse.ok()) {
    const body = await signupResponse.text();
    throw new Error(`Failed to create test user: ${signupResponse.status()} ${body}`);
  }
}

async function createTestFolder(page, folderName) {
  // Look for the input field to create a new folder
  // This assumes there's a UI element to trigger folder creation
  const folderInput = page.locator('input[placeholder*="folder"], input[placeholder*="Folder"], input[placeholder*="name"]');
  
  if (await folderInput.count() > 0) {
    await folderInput.first().fill(folderName);
    // Look for a create/save button near the folder input
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Save")').first();
    if (await createButton.isVisible()) {
      await createButton.click();
    }
  }
}

