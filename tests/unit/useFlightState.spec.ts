import { parseDate } from "@internationalized/date";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";
import { useFlightState } from "../../app/composables/useFlightState";
import { testFlights } from "../fixtures/flights";

const { useRouteMock, useRouterMock } = vi.hoisted(() => ({
	useRouteMock: vi.fn(),
	useRouterMock: vi.fn(),
}));

mockNuxtImport("useRoute", () => useRouteMock);
mockNuxtImport("useRouter", () => useRouterMock);

type QueryShape = Record<string, unknown>;

let route: { query: QueryShape; fullPath: string };
let replaceMock: ReturnType<typeof vi.fn>;

const getLastQueryPayload = () => {
	const lastCall = replaceMock.mock.calls.at(-1);
	return (lastCall?.[0] as { query: QueryShape }).query;
};

const toSearchParamsString = (query: QueryShape) => {
	const params = new URLSearchParams();

	for (const [key, rawValue] of Object.entries(query)) {
		if (rawValue === undefined || rawValue === null) {
			continue;
		}

		if (Array.isArray(rawValue)) {
			for (const value of rawValue) {
				if (value === undefined || value === null) {
					continue;
				}

				params.append(key, String(value));
			}

			continue;
		}

		params.append(key, String(rawValue));
	}

	return params.toString();
};

const setRouteQuery = (query: QueryShape) => {
	route.query = { ...query };
	const searchParams = toSearchParamsString(query);
	route.fullPath = searchParams ? `/?${searchParams}` : "/";
};

const initState = () => {
	const state = useFlightState();

	state.form.value = {
		origin: undefined,
		destination: undefined,
	};
	state.originSearchTerm.value = "";
	state.destinationSearchTerm.value = "";
	state.departureDateValue.value = undefined;
	state.returnDateValue.value = undefined;

	return state;
};

describe("useFlightState", () => {
	beforeEach(() => {
		route = reactive({
			query: {},
			fullPath: "/",
		});

		replaceMock = vi.fn(({ query }: { query?: QueryShape }) => {
			setRouteQuery(query ?? {});
			return Promise.resolve();
		});

		useRouteMock.mockReturnValue(route);
		useRouterMock.mockReturnValue({
			replace: replaceMock,
		});
	});

	it("applyFilters writes form and date drafts into URL query", () => {
		const state = initState();

		state.form.value.origin = "BER";
		state.form.value.destination = "PMI";
		state.departureDateValue.value = parseDate("2030-06-10");
		state.returnDateValue.value = parseDate("2030-06-14");

		state.applyFilters();

		const query = getLastQueryPayload();
		expect(query.origin).toBe("BER");
		expect(query.destination).toBe("PMI");
		expect(query.departureDate).toBe("2030-06-10");
		expect(query.returnDate).toBe("2030-06-14");
	});

	it("resetFilters clears filters but keeps sort in URL", () => {
		setRouteQuery({
			origin: "CGN",
			destination: "VIE",
			departureDate: "2030-05-01",
			returnDate: "2030-05-05",
			sort: "price-asc",
		});

		const state = initState();
		state.resetFilters();

		const query = getLastQueryPayload();
		expect(query.origin).toBeUndefined();
		expect(query.destination).toBeUndefined();
		expect(query.departureDate).toBeUndefined();
		expect(query.returnDate).toBeUndefined();
		expect(query.sort).toBe("price-asc");
		expect(state.form.value).toEqual({
			origin: undefined,
			destination: undefined,
		});
		expect(state.originSearchTerm.value).toBe("");
		expect(state.destinationSearchTerm.value).toBe("");
	});

	it("removeFilter clears only origin", () => {
		setRouteQuery({
			origin: "BER",
			destination: "PMI",
		});

		const state = initState();
		state.removeFilter("origin");

		const query = getLastQueryPayload();
		expect(query.origin).toBeUndefined();
		expect(query.destination).toBe("PMI");
		expect(state.form.value.origin).toBeUndefined();
		expect(state.originSearchTerm.value).toBe("");
	});

	it("removeFilter clears only destination", () => {
		setRouteQuery({
			origin: "BER",
			destination: "PMI",
		});

		const state = initState();
		state.removeFilter("destination");

		const query = getLastQueryPayload();
		expect(query.origin).toBe("BER");
		expect(query.destination).toBeUndefined();
		expect(state.form.value.destination).toBeUndefined();
		expect(state.destinationSearchTerm.value).toBe("");
	});

	it("removeFilter clears only departureDate", () => {
		setRouteQuery({
			departureDate: "2030-06-10",
			returnDate: "2030-06-14",
		});

		const state = initState();
		state.removeFilter("departureDate");

		const query = getLastQueryPayload();
		expect(query.departureDate).toBeUndefined();
		expect(query.returnDate).toBe("2030-06-14");
	});

	it("removeFilter clears only returnDate", () => {
		setRouteQuery({
			departureDate: "2030-06-10",
			returnDate: "2030-06-14",
		});

		const state = initState();
		state.removeFilter("returnDate");

		const query = getLastQueryPayload();
		expect(query.departureDate).toBe("2030-06-10");
		expect(query.returnDate).toBeUndefined();
	});

	it("selectedSort writes to URL immediately", () => {
		const state = initState();

		state.selectedSort.value = "price-desc";

		const query = getLastQueryPayload();
		expect(query.sort).toBe("price-desc");
	});

	it("uses fullPath query as source of truth when route.query is stale", () => {
		route.query = {
			destination: "PMI",
		};
		route.fullPath = "/";

		const state = initState();

		expect(state.appliedFilters.value.destination).toBeUndefined();
	});

	it("computes sorted unique airports from provided flights", () => {
		const flights = ref(testFlights);
		const state = useFlightState(flights);

		expect(state.airports.value).toEqual([
			"BER",
			"CGN",
			"DUS",
			"HAM",
			"LHR",
			"MUC",
			"PMI",
			"VIE",
		]);
	});
});
