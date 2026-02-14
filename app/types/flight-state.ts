export type FlightSortKey = "none" | "price-asc" | "price-desc";

export type SortOption = {
	label: string;
	value: FlightSortKey;
	icon: string;
};

export type ActiveFilterKey =
	| "origin"
	| "destination"
	| "departureDate"
	| "returnDate";

export type AppliedFilters = {
	origin?: string;
	destination?: string;
	departureDate: string;
	returnDate: string;
};

export type FilterForm = {
	origin?: string;
	destination?: string;
};
