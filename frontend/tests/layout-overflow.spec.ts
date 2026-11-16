import { expect, test } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173';

test.use({
    viewport: { width: 390, height: 844 },
    launchOptions: {
        executablePath:
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
});

test.describe('page layout', () => {
    for (const path of ['/leagues', '/rankings']) {
        test(`${path} uses the available mobile content height`, async ({
            page,
        }) => {
            await page.goto(`${baseUrl}${path}`);

            const surface = page.locator('main > div').last();
            await expect(surface).toBeVisible();

            await expect(surface).not.toHaveClass(/h-\[calc\(100vh/);
            await expect(surface).not.toHaveClass(/overflow-hidden/);

            const nav = page.locator('nav').last();
            await page.waitForFunction(() => {
                const surface = document.querySelector('main > div');
                const nav = document.querySelector('nav');
                if (!surface || !nav) return false;

                return (
                    surface.getBoundingClientRect().bottom <=
                    nav.getBoundingClientRect().top
                );
            });
            const surfaceBox = await surface.boundingBox();
            const navBox = await nav.boundingBox();

            expect(surfaceBox).not.toBeNull();
            expect(navBox).not.toBeNull();
            expect(surfaceBox!.y + surfaceBox!.height).toBeLessThanOrEqual(
                navBox!.y
            );
        });
    }

    test('rankings page applies intentional intro padding', async ({ page }) => {
        await page.goto(`${baseUrl}/rankings`);

        const intro = page.locator('main > div > div').first();
        await expect(intro).toHaveClass(/p-6/);
        await expect(intro).not.toHaveClass(/padding-6/);
    });
});