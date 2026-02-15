import { expect, test } from "./fixtures/test";

test("main journey: load -> filter -> reset -> sort", async ({ page, request }) => {
	const apiResponse = await request.get("/api/flights");
	expect(apiResponse.ok()).toBe(true);
	const apiFlights = await apiResponse.json();
	expect(Array.isArray(apiFlights)).toBe(true);
	expect(apiFlights.length).toBeGreaterThan(0);

	await page.goto("/");

	const flightRows = page.locator("ul.space-y-4 > li");
	const sortSelect = page.getByRole("combobox", { name: "Sort flights" });

	await expect(page.getByText("Fligthly")).toBeVisible();
	const initialFlightCount = await flightRows.count();
	expect(initialFlightCount).toBe(4);

	const destinationInput = page.getByLabel("Destination airport");
	await destinationInput.fill("PMI");
	await destinationInput.press("Tab");
	await page.getByRole("button", { name: "Filter flights" }).click();
	await expect(page).toHaveURL(/[\?&]destination=PMI(&|$)/);
	await expect(page.getByRole("button", { name: "To: PMI" })).toBeVisible();
	const filteredFlightCount = await flightRows.count();
	expect(filteredFlightCount).toBe(2);
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
	await expect(page).toHaveURL(/[\?&]sort=price-asc(&|$)/);
	const prices = await flightRows.evaluateAll((rows) =>
		rows.map((row) => {
			const match = row.textContent?.match(/(\d+[.,]\d+)\s*€/);
			const amountText = match?.[1];

			if (!amountText) {
				return NaN;
			}

			return Number(amountText.replace(".", "").replace(",", "."));
		}),
	);

	expect(prices.every((price) => Number.isFinite(price))).toBe(true);
	expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
