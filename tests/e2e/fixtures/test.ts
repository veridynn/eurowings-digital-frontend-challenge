import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { expect, test as base } from "@playwright/test";

type Fixtures = {
	mockFlightsApi: void;
};

export const test = base.extend<Fixtures>({
	mockFlightsApi: [
		async ({ page }, use) => {
			const fixturePath = resolve(process.cwd(), "tests/e2e/fixtures/flights.json");
			const fixtureBody = await readFile(fixturePath, "utf-8");

			await page.route("**/api/flights", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: fixtureBody,
				});
			});

			await use();
			await page.unroute("**/api/flights");
		},
		{ auto: true },
	],
});

export { expect };
