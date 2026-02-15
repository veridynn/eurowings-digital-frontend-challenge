import { expect, test } from "@playwright/test";

test("main journey: load -> filter -> reset -> sort", async ({ page }) => {
	await page.goto("/");

	const flightRows = page.locator("ul.space-y-4 > li");
	const sortSelect = page.getByRole("combobox", { name: "Sort flights" });

	await expect(page.getByText("Fligthly")).toBeVisible();
	const initialFlightCount = await flightRows.count();
	expect(initialFlightCount).toBeGreaterThan(0);
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
	await expect(page).toHaveURL(/[\?&]destination=PMI(&|$)/);
	await expect(page.getByRole("button", { name: "To: PMI" })).toBeVisible();
	const filteredFlightCount = await flightRows.count();
	expect(filteredFlightCount).toBeGreaterThan(0);
	await expect(flightRows.first()).toContainText("PMI");
	await expect(flightRows.last()).toContainText("PMI");

	await page.getByRole("button", { name: "Clear all" }).click();
	await expect(page).not.toHaveURL(
		/[\?&](origin|destination|departureDate|returnDate)=/,
	);
	await expect(page.getByRole("button", { name: "To: PMI" })).toHaveCount(0);
	await expect(page.getByText("No active filters")).toBeVisible();
	await expect(flightRows).toHaveCount(initialFlightCount);

	await sortSelect.click();
	await page.getByRole("option", { name: "Price: Low to High" }).click();
	const prices = await flightRows.evaluateAll((rows) =>
		rows.map((row) => {
			const match = row.textContent?.match(/(\d+[.,]\d+)\s*€/);

			if (!match) {
				return NaN;
			}

			return Number(match[1].replace(".", "").replace(",", "."));
		}),
	);

	expect(prices.every((price) => Number.isFinite(price))).toBe(true);
	expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
