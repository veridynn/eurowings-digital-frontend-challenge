import { expect, test } from "@playwright/test";

test("main journey: load -> filter -> reset -> sort", async ({ page }) => {
	await page.goto("/");

	const flightRows = page.locator("ul > li");
	const sortSelect = page.getByRole("combobox", { name: "Sort flights" });

	await expect(page.getByText("Fligthly")).toBeVisible();
	await expect(flightRows).toHaveCount(4);
	await page.waitForFunction(
		() =>
			(
				window as Window & {
					__E2E_FILTER_HOOK_READY?: boolean;
				}
			).__E2E_FILTER_HOOK_READY === true,
	);

	await page.evaluate(() => {
		window.dispatchEvent(
			new CustomEvent("e2e:set-filters", {
				detail: { destination: "PMI" },
			}),
		);
	});
	await page.getByRole("button", { name: "Filter flights" }).click();
	await expect(page.getByRole("button", { name: "To: PMI" })).toBeVisible();
	await expect(flightRows).toHaveCount(2);
	await expect(flightRows.first()).toContainText("PMI");
	await expect(flightRows.last()).toContainText("PMI");

	await page.getByRole("button", { name: "Clear all" }).click();
	await expect(page.getByText("No active filters")).toBeVisible();
	await expect(flightRows).toHaveCount(4);

	await sortSelect.click();
	await page.getByRole("option", { name: "Price: Low to High" }).click();
	await expect(flightRows.first()).toContainText("60,00 €");
	await expect(flightRows.last()).toContainText("200,00 €");
});
