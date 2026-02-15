import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL: "http://localhost:3000",
	},
	webServer: {
		command: "E2E_MOCK_API=true bun run dev -- --port 3000",
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
