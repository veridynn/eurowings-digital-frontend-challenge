// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],
	app: {
		head: {
			title: "Eurowings Digital Frontend Challenge",
			htmlAttrs: {
				lang: "en",
			},
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
		},
	},
	typescript: {
		typeCheck: true,
	},
});
