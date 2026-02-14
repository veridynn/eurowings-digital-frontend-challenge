import { parseDate } from "@internationalized/date";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import Filters from "../../app/components/Filters.vue";

const { useFlightStateMock } = vi.hoisted(() => ({
	useFlightStateMock: vi.fn(),
}));

mockNuxtImport("useFlightState", () => useFlightStateMock);

const uiStubs = {
	UCard: {
		template: "<section><slot /></section>",
	},
	UFormField: {
		template: "<div><slot /></div>",
	},
	UInputMenu: true,
	UInputDate: {
		template: "<div><slot name='leading' /></div>",
	},
	UPopover: {
		template: "<div><slot /><slot name='content' /></div>",
	},
	UButton: {
		template: "<button type='button'><slot /></button>",
	},
	UCalendar: true,
};

let applyFilters: ReturnType<typeof vi.fn>;

beforeEach(() => {
	applyFilters = vi.fn();

	useFlightStateMock.mockReturnValue({
		form: ref({
			origin: undefined,
			destination: undefined,
		}),
		originSearchTerm: ref(""),
		destinationSearchTerm: ref(""),
		departureDateValue: ref(undefined),
		returnDateValue: ref(undefined),
		departureCalendarOpen: ref(false),
		returnCalendarOpen: ref(false),
		todayDate: ref(parseDate("2030-01-01")),
		departureMaxDate: ref(parseDate("2030-12-31")),
		returnMinDate: ref(parseDate("2030-01-01")),
		returnMaxDate: ref(parseDate("2030-12-31")),
		airports: ref(["BER", "CGN", "PMI"]),
		applyFilters,
	});
});

describe("Filters.vue", () => {
	it("smoke: mounts and renders filter submit action", async () => {
		const wrapper = await mountSuspended(Filters, {
			global: {
				stubs: uiStubs,
			},
		});

		expect(wrapper.text()).toContain("Filter flights");
	});

	it("submits the form and calls applyFilters", async () => {
		const wrapper = await mountSuspended(Filters, {
			global: {
				stubs: uiStubs,
			},
		});

		await wrapper.find("form").trigger("submit");

		expect(applyFilters).toHaveBeenCalledTimes(1);
	});
});
