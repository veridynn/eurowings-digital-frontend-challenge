import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import App from "../../app/app.vue";
import { testFlights } from "../fixtures/flights";

const { useFetchMock, useFlightStateMock } = vi.hoisted(() => ({
	useFetchMock: vi.fn(),
	useFlightStateMock: vi.fn(),
}));

mockNuxtImport("useFetch", () => useFetchMock);
mockNuxtImport("useFlightState", () => useFlightStateMock);

const stubs = {
	UApp: {
		template: "<div data-test='uapp'><slot /></div>",
	},
	UMain: {
		template: "<main><slot /></main>",
	},
	UContainer: {
		template: "<section><slot /></section>",
	},
	Header: {
		template: "<div data-test='header-stub' />",
	},
	Filters: {
		template: "<div data-test='filters-stub' />",
	},
	Toolbar: {
		template: "<div data-test='toolbar-stub' />",
	},
	List: {
		props: ["flights", "pending", "error"],
		template:
			"<div data-test='list-stub'>list {{ flights.length }} {{ pending }} {{ !!error }}</div>",
	},
};

const mountApp = async () =>
	mountSuspended(App, {
		global: {
			stubs,
		},
	});

beforeEach(() => {
	useFetchMock.mockReset();
	useFlightStateMock.mockReset();
});

describe("app.vue", () => {
	it("smoke: mounts shell and renders toolbar when not pending", async () => {
		const flightsRef = ref(testFlights);

		useFetchMock.mockResolvedValue({
			data: flightsRef,
			pending: ref(false),
			error: ref(null),
		});

		const wrapper = await mountApp();

		expect(wrapper.find("[data-test='header-stub']").exists()).toBe(true);
		expect(wrapper.find("[data-test='filters-stub']").exists()).toBe(true);
		expect(wrapper.find("[data-test='toolbar-stub']").exists()).toBe(true);
		expect(wrapper.find("[data-test='list-stub']").text()).toContain("list 4");

		expect(useFetchMock).toHaveBeenCalledTimes(1);
		const [url, options] = useFetchMock.mock.calls[0] ?? [];
		expect(url).toBe("/api/flights");
		expect(options).toMatchObject({
			default: expect.any(Function),
		});
		expect(useFlightStateMock).toHaveBeenCalledWith(flightsRef);
	});

	it("hides toolbar while pending", async () => {
		useFetchMock.mockResolvedValue({
			data: ref(testFlights),
			pending: ref(true),
			error: ref(null),
		});

		const wrapper = await mountApp();

		expect(wrapper.find("[data-test='toolbar-stub']").exists()).toBe(false);
		expect(wrapper.find("[data-test='list-stub']").text()).toContain("true");
	});
});
