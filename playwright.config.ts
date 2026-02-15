import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:3000",
	},
	webServer: {
		command:
			"cp tests/e2e/fixtures/flights.json data/flights.json && bun run dev -- --port 3000",
		url: "http://localhost:3000",
		reuseExistingServer: false,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
