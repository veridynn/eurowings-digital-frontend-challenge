import {
	getLocalTimeZone,
	parseDate,
	today,
	type CalendarDate,
} from "@internationalized/date";
import type { Ref } from "vue";
import type {
	LocationQuery,
	LocationQueryRaw,
	LocationQueryValue,
	LocationQueryValueRaw,
} from "vue-router";
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
	date ? date.toString() : undefined;

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseIsoDate = (value: string | undefined) => {
	if (!value || !isIsoDate(value)) {
		return undefined;
	}

	try {
		return parseDate(value);
	} catch {
		return undefined;
	}
};

const getSingleQueryValue = (
	value:
		| LocationQueryValue
		| LocationQueryValueRaw
		| LocationQueryValue[]
		| LocationQueryValueRaw[]
		| undefined,
) => {
	const raw = Array.isArray(value) ? value[0] : value;

	if (raw === null || raw === undefined) {
		return undefined;
	}

	const trimmed = String(raw).trim();

	return trimmed || undefined;
};

const getQueryFromFullPath = (fullPath: string) => {
	const queryIndex = fullPath.indexOf("?");

	if (queryIndex === -1) {
		return {} as LocationQueryRaw;
	}

	const hashIndex = fullPath.indexOf("#", queryIndex);
	const search = hashIndex === -1
		? fullPath.slice(queryIndex + 1)
		: fullPath.slice(queryIndex + 1, hashIndex);
	const params = new URLSearchParams(search);
	const query: LocationQueryRaw = {};

	for (const [key, value] of params.entries()) {
		const existing = query[key];

		if (Array.isArray(existing)) {
			existing.push(value);
			continue;
		}

		if (existing !== undefined) {
			query[key] = [existing, value];
			continue;
		}

		query[key] = value;
	}

	return query;
};

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
	const date = parseIsoDate(dateValue);

	if (!date) {
		return dateValue;
	}

	return new Intl.DateTimeFormat("de-DE", {
		month: "short",
		day: "2-digit",
		timeZone: "UTC",
	}).format(date.toDate("UTC"));
};

const managedQueryKeys = [
	"origin",
	"destination",
	"departureDate",
	"returnDate",
	"sort",
] as const;

type ManagedQueryKey = (typeof managedQueryKeys)[number];

type ManagedQueryValues = {
	origin?: string;
	destination?: string;
	departureDate: string;
	returnDate: string;
	sort: FlightSortKey;
};

const validSortValues = new Set<FlightSortKey>(["none", "price-asc", "price-desc"]);

const getReturnMinDate = (
	departureDate: CalendarDate | undefined,
	todayDate: CalendarDate,
) => {
	if (!departureDate || departureDate.compare(todayDate) < 0) {
		return todayDate;
	}

	return departureDate;
};

const sanitizeManagedQuery = (
	query: LocationQuery | LocationQueryRaw,
	todayDate: CalendarDate,
	departureMaxDate: CalendarDate | undefined,
	returnMaxDate: CalendarDate | undefined,
): ManagedQueryValues => {
	const origin = getSingleQueryValue(query.origin);
	const destination = getSingleQueryValue(query.destination);
	const rawSort = getSingleQueryValue(query.sort);
	const sort = rawSort && validSortValues.has(rawSort as FlightSortKey)
		? (rawSort as FlightSortKey)
		: "none";
	let departureDate = "";
	let returnDate = "";

	const parsedDepartureDate = parseIsoDate(getSingleQueryValue(query.departureDate));

	if (
		parsedDepartureDate &&
		!isDateOutsideBounds(parsedDepartureDate, todayDate, departureMaxDate)
	) {
		departureDate = parsedDepartureDate.toString();
	}

	const parsedReturnDate = parseIsoDate(getSingleQueryValue(query.returnDate));
	const returnMinDate = getReturnMinDate(
		departureDate ? parseDate(departureDate) : undefined,
		todayDate,
	);

	if (
		parsedReturnDate &&
		!isDateOutsideBounds(parsedReturnDate, returnMinDate, returnMaxDate)
	) {
		returnDate = parsedReturnDate.toString();
	}

	return {
		origin,
		destination,
		departureDate,
		returnDate,
		sort,
	};
};

const applyManagedValuesToQuery = (
	query: LocationQuery | LocationQueryRaw,
	values: ManagedQueryValues,
) => {
	const nextQuery: LocationQueryRaw = { ...query };

	for (const key of managedQueryKeys) {
		delete nextQuery[key];
	}

	if (values.origin) {
		nextQuery.origin = values.origin;
	}

	if (values.destination) {
		nextQuery.destination = values.destination;
	}

	if (values.departureDate) {
		nextQuery.departureDate = values.departureDate;
	}

	if (values.returnDate) {
		nextQuery.returnDate = values.returnDate;
	}

	if (values.sort !== "none") {
		nextQuery.sort = values.sort;
	}

	return nextQuery;
};

const queryValuesMatch = (
	left:
		| LocationQueryValue
		| LocationQueryValueRaw
		| LocationQueryValue[]
		| LocationQueryValueRaw[]
		| undefined,
	right:
		| LocationQueryValue
		| LocationQueryValueRaw
		| LocationQueryValue[]
		| LocationQueryValueRaw[]
		| undefined,
) => {
	if (Array.isArray(left) || Array.isArray(right)) {
		const leftValues = Array.isArray(left)
			? left
			: left === undefined || left === null
				? []
				: [left];
		const rightValues = Array.isArray(right)
			? right
			: right === undefined || right === null
				? []
				: [right];

		if (leftValues.length !== rightValues.length) {
			return false;
		}

		return leftValues.every((value, index) => value === rightValues[index]);
	}

	return left === right;
};

const areQueriesEqual = (
	left: LocationQueryRaw,
	right: LocationQuery | LocationQueryRaw,
) => {
	const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

	for (const key of keys) {
		if (
			!queryValuesMatch(
				left[key as string],
				right[key as string] as
					| LocationQueryValue
					| LocationQueryValueRaw
					| LocationQueryValue[]
					| LocationQueryValueRaw[]
					| undefined,
			)
		) {
			return false;
		}
	}

	return true;
};

export const useFlightState = (flights?: Ref<Flight[]>) => {
	const flightsState = useState<Flight[]>("flight-state:flights", () => []);
	const route = useRoute();
	const router = useRouter();

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

	const getCurrentQuery = () => getQueryFromFullPath(route.fullPath);

	const managedQueryValues = computed(() =>
		sanitizeManagedQuery(
			getCurrentQuery(),
			todayDate.value,
			departureMaxDate.value,
			returnMaxDate.value,
		),
	);

	const updateQuery = (
		patch: Partial<Record<ManagedQueryKey, string | FlightSortKey | undefined>>,
	) => {
		const currentQuery = getCurrentQuery();
		const nextQuery: LocationQueryRaw = { ...currentQuery };

		for (const key of managedQueryKeys) {
			if (!(key in patch)) {
				continue;
			}

			const value = patch[key];

			if (key === "sort") {
				if (!value || value === "none") {
					delete nextQuery.sort;
				} else {
					nextQuery.sort = value;
				}

				continue;
			}

			const normalized = typeof value === "string" ? value.trim() : "";

			if (normalized) {
				nextQuery[key] = normalized;
			} else {
				delete nextQuery[key];
			}
		}

		const sanitizedValues = sanitizeManagedQuery(
			nextQuery,
			todayDate.value,
			departureMaxDate.value,
			returnMaxDate.value,
		);
		const canonicalQuery = applyManagedValuesToQuery(nextQuery, sanitizedValues);
		const isEqual = areQueriesEqual(canonicalQuery, currentQuery);

		if (isEqual) {
			return;
		}

		void router.replace({ query: canonicalQuery });
	};

	const appliedFilters = computed<AppliedFilters>(() => ({
		origin: managedQueryValues.value.origin,
		destination: managedQueryValues.value.destination,
		departureDate: managedQueryValues.value.departureDate,
		returnDate: managedQueryValues.value.returnDate,
	}));

	const selectedSort = computed<FlightSortKey>({
		get: () => managedQueryValues.value.sort,
		set: (value) => {
			updateQuery({
				sort: value,
			});
		},
	});

	const departureDateValue = computed<CalendarDate | undefined>({
		get: () => parseIsoDate(departureDateDraft.value),
		set: (date) => {
			departureDateDraft.value = toIsoDate(date) ?? "";
		},
	});

	const returnDateValue = computed<CalendarDate | undefined>({
		get: () => parseIsoDate(returnDateDraft.value),
		set: (date) => {
			returnDateDraft.value = toIsoDate(date) ?? "";
		},
	});

	const returnMinDate = computed(() => {
		return getReturnMinDate(departureDateValue.value, todayDate.value);
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

	watch(
		() => appliedFilters.value.origin,
		(origin) => {
			form.value.origin = origin;
			originSearchTerm.value = origin ?? "";
		},
		{
			immediate: true,
		},
	);

	watch(
		() => appliedFilters.value.destination,
		(destination) => {
			form.value.destination = destination;
			destinationSearchTerm.value = destination ?? "";
		},
		{
			immediate: true,
		},
	);

	watch(
		() => appliedFilters.value.departureDate,
		(departureDate) => {
			departureDateDraft.value = departureDate;
		},
		{
			immediate: true,
		},
	);

	watch(
		() => appliedFilters.value.returnDate,
		(returnDate) => {
			returnDateDraft.value = returnDate;
		},
		{
			immediate: true,
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

	if (import.meta.client) {
		watch(
			managedQueryValues,
			(values) => {
				const currentQuery = getCurrentQuery();
				const canonicalQuery = applyManagedValuesToQuery(currentQuery, values);

				if (areQueriesEqual(canonicalQuery, currentQuery)) {
					return;
				}

				void router.replace({
					query: canonicalQuery,
				});
			},
			{
				immediate: true,
			},
		);
	}

	const applyFilters = () => {
		updateQuery({
			origin: form.value.origin,
			destination: form.value.destination,
			departureDate: departureDateDraft.value,
			returnDate: returnDateDraft.value,
		});
	};

	const resetFilters = () => {
		form.value.origin = undefined;
		form.value.destination = undefined;

		originSearchTerm.value = "";
		destinationSearchTerm.value = "";

		updateQuery({
			origin: undefined,
			destination: undefined,
			departureDate: undefined,
			returnDate: undefined,
		});
	};

	const removeFilter = (key: ActiveFilterKey) => {
		if (key === "origin") {
			form.value.origin = undefined;
			originSearchTerm.value = "";
			updateQuery({
				origin: undefined,
			});
			return;
		}

		if (key === "destination") {
			form.value.destination = undefined;
			destinationSearchTerm.value = "";
			updateQuery({
				destination: undefined,
			});
			return;
		}

		if (key === "departureDate") {
			updateQuery({
				departureDate: undefined,
			});
			return;
		}

		updateQuery({
			returnDate: undefined,
		});
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
