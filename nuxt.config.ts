// https://nuxt.com/docs/api/configuration/nuxt-config
const disableSsrForE2E = process.env.E2E_MOCK_API === "true";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	ssr: !disableSsrForE2E,
	modules: ["@nuxt/ui"],
	css: ["~/assets/css/main.css"],
	ui: {
		colorMode: false,
		experimental: {
			componentDetection: true,
		},
	},
	app: {
		head: {
			title: "Flightly",
			htmlAttrs: {
				lang: "en",
			},
			meta: [
				{
					name: "description",
					content:
						"Browse and filter flight offers by origin, destination, and travel dates with Flightly.",
				},
			],
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
		},
	},
	typescript: {
		typeCheck: true,
	},
});
