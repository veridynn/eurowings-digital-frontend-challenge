import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 4173);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
	testDir: "./tests/e2e",
	use: {
		baseURL,
	},
	webServer: {
		command: `E2E_MOCK_API=true bun run dev -- --port ${port}`,
		url: baseURL,
		timeout: 120_000,
		reuseExistingServer: false,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
