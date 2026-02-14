import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import Header from "../../app/components/Header.vue";

describe("Header.vue", () => {
	it("smoke: mounts and renders app title", async () => {
		const wrapper = await mountSuspended(Header, {
			global: {
				stubs: {
					UHeader: {
						template: "<header><slot name='title' /></header>",
					},
					UIcon: {
						template: "<i />",
					},
				},
			},
		});

		expect(wrapper.text()).toContain("Fligthly");
	});
});
