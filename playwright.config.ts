import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:3000",
	},
	webServer: {
		command: "bun run dev -- --port 3000",
		url: "http://localhost:3000",
		reuseExistingServer: false,
		env: {
			E2E_FLIGHTS_FIXTURE_PATH: "tests/e2e/fixtures/flights.json",
		},
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
