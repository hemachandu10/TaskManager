import { test, expect } from "@playwright/test";

test.describe("TaskVault End-to-End User Journeys", () => {
  test("Journey 1-14: Comprehensive Task Lifecycle & Navigation", async ({ page }) => {
    // 1. Open the application (redirects to /dashboard)
    await page.goto("/");
    await expect(page).toHaveURL(/.*dashboard/);

    // Verify Brand Title & Navigation
    await expect(page.locator("text=TaskVault")).toBeVisible();
    await expect(page.locator("text=Personal Task & Learning Vault")).toBeVisible();

    // 2. Navigation items check (To Do, Do Later, Completed, Archived, Trash)
    await expect(page.locator("nav >> text=To Do")).toBeVisible();
    await expect(page.locator("nav >> text=Do Later")).toBeVisible();
    await expect(page.locator("nav >> text=Completed")).toBeVisible();
    await expect(page.locator("nav >> text=Archived")).toBeVisible();
    await expect(page.locator("nav >> text=Trash")).toBeVisible();

    // 3. Create a task with a URL using the Add Task button
    await page.click("button:has-text('Add Task')");
    await expect(page.locator("text=Add Task to Vault")).toBeVisible();

    // Fill Title and URL
    await page.fill("input[placeholder*='LeetCode 42']", "Playwright E2E LeetCode 3Sum Challenge");
    await page.fill("input[placeholder*='https://']", "https://leetcode.com/problems/3sum/");

    // 4. Save notes and progress
    await page.fill(
      "textarea[placeholder*='Record what remains to be done']",
      "Need to handle duplicates carefully when shifting left and right pointers."
    );

    // Submit Task
    await page.click("button:has-text('Create Task')");
    await expect(page.locator("text=Task created")).toBeVisible();

    // Verify task appears in task cards
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // 5. Open details modal and review saved notes
    await page.click("text=Playwright E2E LeetCode 3Sum Challenge");
    await expect(page.locator("text=Need to handle duplicates carefully")).toBeVisible();

    // Edit and save progress notes
    await page.fill(
      "textarea[placeholder*='Record where you left off']",
      "Optimal solution achieved with O(N log N) sort + two pointers. Review space complexity."
    );
    await page.click("button:has-text('Save Progress Notes')");
    await expect(page.locator("text=Task updated")).toBeVisible();

    // Close details modal
    await page.click("button[aria-label='Close dialog']");

    // 6. Navigate to To Do page
    await page.click("nav >> text=To Do");
    await expect(page).toHaveURL(/.*todo/);
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // 7. Search for the task
    const searchInput = page.locator("input[placeholder*='Search tasks']");
    await searchInput.fill("3Sum");
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // Clear search
    await page.click("button[aria-label='Clear search']");

    // 8. Filter and sort
    await page.selectOption("select >> nth=0", "priority_desc");

    // 9. Status transitions: Move task to Do Later
    const taskCard = page.locator(".group", { hasText: "Playwright E2E LeetCode 3Sum Challenge" });
    await taskCard.locator("button[aria-label='Task options']").click();
    await page.click("button:has-text('Move to Do Later')");
    await expect(page.locator("text=Task updated")).toBeVisible();

    // Verify it moved from To Do to Do Later
    await page.click("nav >> text=Do Later");
    await expect(page).toHaveURL(/.*later/);
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // 10. Mark it Completed
    const laterCard = page.locator(".group", { hasText: "Playwright E2E LeetCode 3Sum Challenge" });
    await laterCard.locator("button[aria-label='Task options']").click();
    await page.click("button:has-text('Mark Completed')");

    // Verify in Completed page
    await page.click("nav >> text=Completed");
    await expect(page).toHaveURL(/.*completed/);
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // 11. Archive and restore a task
    const completedCard = page.locator(".group", { hasText: "Playwright E2E LeetCode 3Sum Challenge" });
    await completedCard.locator("button[aria-label='Task options']").click();
    await page.click("button:has-text('Archive Task')");

    // Check Archived page
    await page.click("nav >> text=Archived");
    await expect(page).toHaveURL(/.*archived/);
    await expect(page.locator("text=Playwright E2E LeetCode 3Sum Challenge")).toBeVisible();

    // Restore from archive
    const archivedCard = page.locator(".group", { hasText: "Playwright E2E LeetCode 3Sum Challenge" });
    await archivedCard.locator("button[aria-label='Task options']").click();
    await page.click("button:has-text('Restore from Archive')");

    // 12. Soft-delete to Trash and Undo
    await page.click("nav >> text=Completed");
    const restoredCard = page.locator(".group", { hasText: "Playwright E2E LeetCode 3Sum Challenge" });
    await restoredCard.locator("button[aria-label='Task options']").click();
    await page.click("button:has-text('Move to Trash')");
    await expect(page.locator("text=Task moved to trash")).toBeVisible();

    // Click Undo in toast
    if (await page.locator("button:has-text('Undo')").isVisible()) {
      await page.click("button:has-text('Undo')");
      await expect(page.locator("text=Task restored")).toBeVisible();
    }

    // 13. Theme toggle verification
    const htmlTag = page.locator("html");
    const isDarkInitially = await htmlTag.evaluate((el: Element) => el.classList.contains("dark"));
    await page.click("button[aria-label='Toggle theme']");
    const isDarkAfterToggle = await htmlTag.evaluate((el: Element) => el.classList.contains("dark"));
    expect(isDarkAfterToggle).not.toBe(isDarkInitially);

    // 14. Sign in route verification
    await page.goto("/login");
    await expect(page.locator("text=Sign in to TaskVault")).toBeVisible();
    await expect(page.locator("button:has-text('Continue with Google')")).toBeVisible();
  });
});
