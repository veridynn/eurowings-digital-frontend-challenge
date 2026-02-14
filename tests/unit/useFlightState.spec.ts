import { parseDate } from "@internationalized/date";
import { beforeEach, describe, expect, it } from "vitest";
import { ref } from "vue";
import { useFlightState } from "../../app/composables/useFlightState";
import { testFlights } from "../fixtures/flights";

const resetState = () => {
	const state = useFlightState();

	state.form.value = {
		origin: undefined,
		destination: undefined,
	};
	state.appliedFilters.value = {
		origin: undefined,
		destination: undefined,
		departureDate: "",
		returnDate: "",
	};
	state.selectedSort.value = "none";
	state.originSearchTerm.value = "";
	state.destinationSearchTerm.value = "";
	state.departureDateValue.value = undefined;
	state.returnDateValue.value = undefined;

	return state;
};

describe("useFlightState", () => {
	beforeEach(() => {
		resetState();
	});

	it("applyFilters copies form and date drafts into appliedFilters", () => {
		const state = resetState();

		state.form.value.origin = "BER";
		state.form.value.destination = "PMI";
		state.departureDateValue.value = parseDate("2030-06-10");
		state.returnDateValue.value = parseDate("2030-06-14");

		state.applyFilters();

		expect(state.appliedFilters.value).toEqual({
			origin: "BER",
			destination: "PMI",
			departureDate: "2030-06-10",
			returnDate: "2030-06-14",
		});
	});

	it("resetFilters clears form, applied filters, search terms and date drafts", () => {
		const state = resetState();

		state.form.value.origin = "CGN";
		state.form.value.destination = "VIE";
		state.originSearchTerm.value = "CG";
		state.destinationSearchTerm.value = "VI";
		state.departureDateValue.value = parseDate("2030-05-01");
		state.returnDateValue.value = parseDate("2030-05-05");
		state.applyFilters();

		state.resetFilters();

		expect(state.form.value).toEqual({
			origin: undefined,
			destination: undefined,
		});
		expect(state.appliedFilters.value).toEqual({
			origin: undefined,
			destination: undefined,
			departureDate: "",
			returnDate: "",
		});
		expect(state.originSearchTerm.value).toBe("");
		expect(state.destinationSearchTerm.value).toBe("");
		expect(state.departureDateValue.value).toBeUndefined();
		expect(state.returnDateValue.value).toBeUndefined();
	});

	it("removeFilter clears only origin and its search term", () => {
		const state = resetState();

		state.form.value.origin = "BER";
		state.form.value.destination = "PMI";
		state.originSearchTerm.value = "BE";
		state.destinationSearchTerm.value = "PM";
		state.applyFilters();

		state.removeFilter("origin");

		expect(state.form.value.origin).toBeUndefined();
		expect(state.appliedFilters.value.origin).toBeUndefined();
		expect(state.originSearchTerm.value).toBe("");
		expect(state.form.value.destination).toBe("PMI");
		expect(state.appliedFilters.value.destination).toBe("PMI");
		expect(state.destinationSearchTerm.value).toBe("PM");
	});

	it("removeFilter clears only destination and its search term", () => {
		const state = resetState();

		state.form.value.origin = "BER";
		state.form.value.destination = "PMI";
		state.originSearchTerm.value = "BE";
		state.destinationSearchTerm.value = "PM";
		state.applyFilters();

		state.removeFilter("destination");

		expect(state.form.value.destination).toBeUndefined();
		expect(state.appliedFilters.value.destination).toBeUndefined();
		expect(state.destinationSearchTerm.value).toBe("");
		expect(state.form.value.origin).toBe("BER");
		expect(state.appliedFilters.value.origin).toBe("BER");
		expect(state.originSearchTerm.value).toBe("BE");
	});

	it("removeFilter clears only departureDate", () => {
		const state = resetState();

		state.departureDateValue.value = parseDate("2030-06-10");
		state.returnDateValue.value = parseDate("2030-06-14");
		state.applyFilters();

		state.removeFilter("departureDate");

		expect(state.appliedFilters.value.departureDate).toBe("");
		expect(state.departureDateValue.value).toBeUndefined();
		expect(state.appliedFilters.value.returnDate).toBe("2030-06-14");
		expect(state.returnDateValue.value?.toString()).toBe("2030-06-14");
	});

	it("removeFilter clears only returnDate", () => {
		const state = resetState();

		state.departureDateValue.value = parseDate("2030-06-10");
		state.returnDateValue.value = parseDate("2030-06-14");
		state.applyFilters();

		state.removeFilter("returnDate");

		expect(state.appliedFilters.value.returnDate).toBe("");
		expect(state.returnDateValue.value).toBeUndefined();
		expect(state.appliedFilters.value.departureDate).toBe("2030-06-10");
		expect(state.departureDateValue.value?.toString()).toBe("2030-06-10");
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
