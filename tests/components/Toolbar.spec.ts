import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref, type Ref } from "vue";
import Toolbar from "../../app/components/Toolbar.vue";
import type { ActiveFilterKey, FlightSortKey } from "../../app/types/flight-state";

const { useFlightStateMock } = vi.hoisted(() => ({
	useFlightStateMock: vi.fn(),
}));

mockNuxtImport("useFlightState", () => useFlightStateMock);

const uiStubs = {
	UButton: {
		emits: ["click"],
		template:
			'<button type="button" @click="$emit(\'click\')"><slot /></button>',
	},
	UFormField: {
		template: "<div><slot /></div>",
	},
	USelect: {
		template: "<select><slot name='leading' /></select>",
	},
	UIcon: {
		template: "<i />",
	},
};

type Chip = {
	key: ActiveFilterKey;
	label: string;
};

let activeFilterChips: Ref<Chip[]>;
let selectedSort: Ref<FlightSortKey>;
let removeFilter: ReturnType<typeof vi.fn>;
let resetFilters: ReturnType<typeof vi.fn>;

const mountToolbar = async () =>
	mountSuspended(Toolbar, {
		global: {
			stubs: uiStubs,
		},
	});

beforeEach(() => {
	activeFilterChips = ref([]);
	selectedSort = ref("none");
	removeFilter = vi.fn();
	resetFilters = vi.fn();

	useFlightStateMock.mockReturnValue({
		activeFilterChips,
		removeFilter,
		resetFilters,
		selectedSort,
		sortOptions: [
			{
				label: "Default order",
				value: "none",
				icon: "i-lucide-arrow-up-down",
			},
		],
		selectedSortOption: ref({
			label: "Default order",
			value: "none",
			icon: "i-lucide-arrow-up-down",
		}),
	});
});

describe("Toolbar.vue", () => {
	it("smoke: mounts and shows empty-chip message", async () => {
		const wrapper = await mountToolbar();

		expect(wrapper.text()).toContain("No active filters");
	});

	it("renders chips and handles chip removal and clear-all", async () => {
		activeFilterChips.value = [
			{ key: "origin", label: "From: BER" },
			{ key: "destination", label: "To: PMI" },
		];

		const wrapper = await mountToolbar();

		expect(wrapper.text()).toContain("From: BER");
		expect(wrapper.text()).toContain("To: PMI");

		const buttons = wrapper.findAll("button");
		expect(buttons).toHaveLength(3);

		await buttons[0]?.trigger("click");
		expect(removeFilter).toHaveBeenCalledWith("origin");

		await buttons[2]?.trigger("click");
		expect(resetFilters).toHaveBeenCalledTimes(1);
	});
});
