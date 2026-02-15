import { defineVitestConfig } from "@nuxt/test-utils/config";
import { configDefaults } from "vitest/config";

export default defineVitestConfig({
	test: {
		environment: "nuxt",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
		exclude: [...configDefaults.exclude, "tests/e2e/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
