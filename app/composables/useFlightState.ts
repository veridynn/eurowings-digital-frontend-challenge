import {
	getLocalTimeZone,
	parseDate,
	today,
	type CalendarDate,
} from "@internationalized/date";
import type { Ref } from "vue";
import type {
	ActiveFilterKey,
	AppliedFilters,
	FilterForm,
	FlightSortKey,
	SortOption,
} from "~/types/flight-state";

const sortOptions: SortOption[] = [
	{
		label: "Default order",
		value: "none",
		icon: "i-lucide-arrow-up-down",
	},
	{
		label: "Price: Low to High",
		value: "price-asc",
		icon: "i-lucide-arrow-down-narrow-wide",
	},
	{
		label: "Price: High to Low",
		value: "price-desc",
		icon: "i-lucide-arrow-up-wide-narrow",
	},
];

const toIsoDate = (date: CalendarDate | undefined) =>
	date ? date.toString() : "";

const isDateOutsideBounds = (
	date: CalendarDate,
	minDate: CalendarDate,
	maxDate?: CalendarDate,
) => {
	if (date.compare(minDate) < 0) {
		return true;
	}

	if (maxDate && date.compare(maxDate) > 0) {
		return true;
	}

	return false;
};

const formatDateShort = (dateValue: string) => {
	const date = new Date(dateValue);

	return new Intl.DateTimeFormat("de-DE", {
		month: "short",
		day: "2-digit",
	}).format(date);
};

export const useFlightState = (flights?: Ref<Flight[]>) => {
	const flightsState = useState<Flight[]>("flight-state:flights", () => []);

	if (flights) {
		watch(
			flights,
			(nextFlights) => {
				flightsState.value = nextFlights;
			},
			{ immediate: true },
		);
	}

	const form = useState<FilterForm>("flight-state:form", () => ({
		origin: undefined,
		destination: undefined,
	}));

	const appliedFilters = useState<AppliedFilters>("flight-state:applied-filters", () => ({
		origin: undefined,
		destination: undefined,
		departureDate: "",
		returnDate: "",
	}));

	const selectedSort = useState<FlightSortKey>("flight-state:selected-sort", () => "none");
	const originSearchTerm = useState<string>("flight-state:origin-search-term", () => "");
	const destinationSearchTerm = useState<string>(
		"flight-state:destination-search-term",
		() => "",
	);
	const departureDateDraft = useState<string>("flight-state:departure-date-draft", () => "");
	const returnDateDraft = useState<string>("flight-state:return-date-draft", () => "");
	const departureCalendarOpen = useState<boolean>(
		"flight-state:departure-calendar-open",
		() => false,
	);
	const returnCalendarOpen = useState<boolean>(
		"flight-state:return-calendar-open",
		() => false,
	);

	const departureDateValue = computed<CalendarDate | undefined>({
		get: () =>
			departureDateDraft.value ? parseDate(departureDateDraft.value) : undefined,
		set: (date) => {
			departureDateDraft.value = toIsoDate(date);
		},
	});

	const returnDateValue = computed<CalendarDate | undefined>({
		get: () => (returnDateDraft.value ? parseDate(returnDateDraft.value) : undefined),
		set: (date) => {
			returnDateDraft.value = toIsoDate(date);
		},
	});

	const todayDate = computed(() => today(getLocalTimeZone()));

	const getLatestDateFromFlights = (dateSelector: (flight: Flight) => string) => {
		let latestDate = "";

		for (const flight of flightsState.value) {
			const candidateDate = dateSelector(flight);

			if (!latestDate || candidateDate > latestDate) {
				latestDate = candidateDate;
			}
		}

		return latestDate ? parseDate(latestDate) : undefined;
	};

	const departureMaxDate = computed(() =>
		getLatestDateFromFlights((flight) => flight.departureDate),
	);

	const returnMaxDate = computed(() =>
		getLatestDateFromFlights((flight) => flight.returnDate),
	);

	const returnMinDate = computed(() => {
		const departureDate = departureDateValue.value ?? todayDate.value;

		return departureDate.compare(todayDate.value) < 0
			? todayDate.value
			: departureDate;
	});

	const airports = computed(() => {
		const airportSet = new Set<string>();

		for (const flight of flightsState.value) {
			airportSet.add(flight.origin);
			airportSet.add(flight.destination);
		}

		return [...airportSet].sort((a, b) => a.localeCompare(b));
	});

	const selectedSortOption = computed(() =>
		sortOptions.find((option) => option.value === selectedSort.value),
	);

	const activeFilterChips = computed(() => {
		const chips: { key: ActiveFilterKey; label: string }[] = [];
		const filters = appliedFilters.value;

		if (filters.origin) {
			chips.push({
				key: "origin",
				label: `From: ${filters.origin}`,
			});
		}

		if (filters.destination) {
			chips.push({
				key: "destination",
				label: `To: ${filters.destination}`,
			});
		}

		if (filters.departureDate) {
			chips.push({
				key: "departureDate",
				label: `Depart: ${formatDateShort(filters.departureDate)}`,
			});
		}

		if (filters.returnDate) {
			chips.push({
				key: "returnDate",
				label: `Return: ${formatDateShort(filters.returnDate)}`,
			});
		}

		return chips;
	});

	if (flights) {
		watch(
			() => form.value.origin,
			(origin) => {
				if (origin) {
					return;
				}

				if (appliedFilters.value.origin) {
					appliedFilters.value.origin = undefined;
				}

				originSearchTerm.value = "";
			},
		);

		watch(
			() => form.value.destination,
			(destination) => {
				if (destination) {
					return;
				}

				if (appliedFilters.value.destination) {
					appliedFilters.value.destination = undefined;
				}

				destinationSearchTerm.value = "";
			},
		);

		watch(departureDateValue, () => {
			if (
				returnDateValue.value &&
				isDateOutsideBounds(
					returnDateValue.value,
					returnMinDate.value,
					returnMaxDate.value,
				)
			) {
				returnDateValue.value = undefined;
			}
		});

		watch(returnDateValue, (returnDate) => {
			if (
				returnDate &&
				isDateOutsideBounds(returnDate, returnMinDate.value, returnMaxDate.value)
			) {
				returnDateValue.value = undefined;
			}
		});

		watch(
			[todayDate, departureMaxDate, returnMaxDate, returnMinDate],
			() => {
				const departureDate = departureDateValue.value;

				if (
					departureDate &&
					isDateOutsideBounds(
						departureDate,
						todayDate.value,
						departureMaxDate.value,
					)
				) {
					departureDateValue.value = undefined;
				}

				const returnDate = returnDateValue.value;

				if (
					returnDate &&
					isDateOutsideBounds(returnDate, returnMinDate.value, returnMaxDate.value)
				) {
					returnDateValue.value = undefined;
				}
			},
			{
				immediate: true,
			},
		);
	}

	const applyFilters = () => {
		appliedFilters.value = {
			origin: form.value.origin,
			destination: form.value.destination,
			departureDate: departureDateDraft.value,
			returnDate: returnDateDraft.value,
		};
	};

	const resetFilters = () => {
		form.value.origin = undefined;
		form.value.destination = undefined;

		appliedFilters.value = {
			origin: undefined,
			destination: undefined,
			departureDate: "",
			returnDate: "",
		};

		originSearchTerm.value = "";
		destinationSearchTerm.value = "";
		departureDateValue.value = undefined;
		returnDateValue.value = undefined;
	};

	const removeFilter = (key: ActiveFilterKey) => {
		if (key === "origin") {
			form.value.origin = undefined;
			appliedFilters.value.origin = undefined;
			originSearchTerm.value = "";
			return;
		}

		if (key === "destination") {
			form.value.destination = undefined;
			appliedFilters.value.destination = undefined;
			destinationSearchTerm.value = "";
			return;
		}

		if (key === "departureDate") {
			appliedFilters.value.departureDate = "";
			departureDateValue.value = undefined;
			return;
		}

		appliedFilters.value.returnDate = "";
		returnDateValue.value = undefined;
	};

	return {
		form,
		appliedFilters,
		selectedSort,
		sortOptions,
		selectedSortOption,
		originSearchTerm,
		destinationSearchTerm,
		departureDateValue,
		returnDateValue,
		departureCalendarOpen,
		returnCalendarOpen,
		todayDate,
		departureMaxDate,
		returnMinDate,
		returnMaxDate,
		airports,
		activeFilterChips,
		applyFilters,
		resetFilters,
		removeFilter,
	};
};
