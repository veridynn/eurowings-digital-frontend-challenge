import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, type Ref } from "vue";
import List from "../../app/components/List.vue";
import type { AppliedFilters, FlightSortKey } from "../../app/types/flight-state";
import { testFlights } from "../fixtures/flights";

const { useFlightStateMock } = vi.hoisted(() => ({
	useFlightStateMock: vi.fn(),
}));

mockNuxtImport("useFlightState", () => useFlightStateMock);

const uiStubs = {
	UIcon: {
		template: "<i><slot /></i>",
	},
	UCard: {
		template: "<article><slot /></article>",
	},
	UEmpty: {
		props: ["title", "description"],
		template:
			"<div><h2>{{ title }}</h2><p>{{ description }}</p><slot /></div>",
	},
	UButton: {
		emits: ["click"],
		template:
			'<button type="button" @click="$emit(\'click\')"><slot /></button>',
	},
	USeparator: {
		template: "<hr />",
	},
};

const defaultFilters = (): AppliedFilters => ({
	origin: undefined,
	destination: undefined,
	departureDate: "",
	returnDate: "",
});

let appliedFilters: Ref<AppliedFilters>;
let selectedSort: Ref<FlightSortKey>;
let resetFilters: ReturnType<typeof vi.fn>;

const mountList = async (overrides?: { pending?: boolean; error?: unknown }) =>
	mountSuspended(List, {
		props: {
			flights: testFlights,
			pending: false,
			error: null,
			...overrides,
		},
		global: {
			stubs: uiStubs,
		},
	});

beforeEach(() => {
	appliedFilters = ref(defaultFilters());
	selectedSort = ref("none");
	resetFilters = vi.fn();

	useFlightStateMock.mockReturnValue({
		appliedFilters,
		selectedSort,
		resetFilters,
	});
});

describe("List.vue", () => {
	it("renders loading state when pending", async () => {
		const wrapper = await mountList({ pending: true });

		expect(wrapper.find(".animate-spin").exists()).toBe(true);
		expect(wrapper.findAll("li")).toHaveLength(0);
	});

	it("renders error state when loading fails", async () => {
		const wrapper = await mountList({ error: new Error("Request failed") });

		expect(wrapper.text()).toContain("Failed to load data.");
	});

	it("shows all flights when no filters are active", async () => {
		const wrapper = await mountList();

		expect(wrapper.findAll("li")).toHaveLength(testFlights.length);
	});

	it("filters flights by origin", async () => {
		appliedFilters.value.origin = "BER";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights).toHaveLength(1);
		expect(flights[0]?.text()).toContain("BER");
	});

	it("filters flights by destination", async () => {
		appliedFilters.value.destination = "PMI";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights).toHaveLength(1);
		expect(flights[0]?.text()).toContain("PMI");
	});

	it("filters flights by departure date", async () => {
		appliedFilters.value.departureDate = "2030-07-20";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights).toHaveLength(1);
		expect(flights[0]?.text()).toContain("MUC");
	});

	it("filters flights by return date", async () => {
		appliedFilters.value.returnDate = "2030-05-05";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights).toHaveLength(1);
		expect(flights[0]?.text()).toContain("CGN");
	});

	it("sorts flights by price ascending with uuid tie-break", async () => {
		selectedSort.value = "price-asc";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights[0]?.text()).toContain("BER");
		expect(flights[1]?.text()).toContain("MUC");
		expect(flights[2]?.text()).toContain("CGN");
		expect(flights[3]?.text()).toContain("HAM");
	});

	it("sorts flights by price descending", async () => {
		selectedSort.value = "price-desc";

		const wrapper = await mountList();
		const flights = wrapper.findAll("li");

		expect(flights[0]?.text()).toContain("HAM");
		expect(flights[1]?.text()).toContain("CGN");
	});

	it("renders empty state and reset action when filters remove all flights", async () => {
		appliedFilters.value.origin = "STR";

		const wrapper = await mountList();

		expect(wrapper.text()).toContain("No flights");
		expect(wrapper.text()).toContain("No flights found for the selected filters.");

		const resetButton = wrapper
			.findAll("button")
			.find((button) => button.text().includes("Reset filters"));

		expect(resetButton).toBeDefined();
		await resetButton?.trigger("click");
		expect(resetFilters).toHaveBeenCalledTimes(1);
	});

	it("renders seat availability warning only for low inventory", async () => {
		const wrapper = await mountList();
		const normalizedText = wrapper.text().replace(/\s+/g, " ");

		expect(normalizedText).toContain("Only 1 seat available");
		expect(normalizedText).toContain("Only 2 seats available");
		expect(normalizedText).not.toContain("Only 4 seats available");
	});
});
