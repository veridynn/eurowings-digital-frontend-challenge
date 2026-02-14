<script setup lang="ts">
import type { FlightSortKey } from "~/types/flight-state";

const props = defineProps<{
	flights: Flight[];
	pending: boolean;
	error: unknown;
}>();

const { appliedFilters, selectedSort, resetFilters } = useFlightState();

const filteredFlights = computed(() => {
	const applied = appliedFilters.value;

	return props.flights.filter((flight) => {
		if (applied.origin && flight.origin !== applied.origin) {
			return false;
		}

		if (applied.destination && flight.destination !== applied.destination) {
			return false;
		}

		if (
			applied.departureDate &&
			flight.departureDate !== applied.departureDate
		) {
			return false;
		}

		if (applied.returnDate && flight.returnDate !== applied.returnDate) {
			return false;
		}

		return true;
	});
});

const sortedFlights = computed(() => {
	const items = [...filteredFlights.value];

	if (selectedSort.value === "none") {
		return items;
	}

	const comparators: Record<
		Exclude<FlightSortKey, "none">,
		(a: Flight, b: Flight) => number
	> = {
		"price-asc": (a, b) => a.price.amount - b.price.amount,
		"price-desc": (a, b) => b.price.amount - a.price.amount,
	};

	const compare = comparators[selectedSort.value];

	items.sort((a, b) => {
		const result = compare(a, b);

		if (result !== 0) {
			return result;
		}

		return a.uuid.localeCompare(b.uuid);
	});

	return items;
});

const formatDateShort = (dateValue: string) => {
	const date = new Date(dateValue);

	return new Intl.DateTimeFormat("de-DE", {
		month: "short",
		day: "2-digit",
	}).format(date);
};

const getDurationInDays = (departureDate: string, returnDate: string) => {
	const departure = new Date(departureDate);
	const returning = new Date(returnDate);
	const msPerDay = 1000 * 60 * 60 * 24;

	return Math.max(
		1,
		Math.round((returning.getTime() - departure.getTime()) / msPerDay),
	);
};

const formatPrice = (amount: number, currency: string) =>
	new Intl.NumberFormat("de-DE", {
		style: "currency",
		currency,
	}).format(amount);
</script>

<template>
	<UIcon
		v-if="pending"
		name="i-lucide-loader-circle"
		class="size-10 h-[calc(100vh-var(--ui-header-height))] animate-spin text-magenta"
	/>

	<p v-else-if="error" class="text-red-600">Failed to load data.</p>

	<div v-else-if="!sortedFlights.length" class="space-y-3">
		<UEmpty
			size="xl"
			variant="naked"
			icon="i-lucide-inbox"
			title="No flights"
			description="No flights found for the selected filters."
		/>
		<UButton
			icon="i-lucide-funnel-x"
			color="primary"
			variant="subtle"
			@click="resetFilters"
		>
			Reset filters
		</UButton>
	</div>

	<ul v-else class="space-y-4">
		<li v-for="flight in sortedFlights" :key="flight.uuid">
			<UCard class="shadow-lg">
				<div class="sm:flex sm:justify-between">
					<div
						class="flex flex-col justify-center after:-mx-4 after:h-px after:w-auto after:bg-old-neutral-200 sm:basis-1/2 sm:after:content-none"
					>
						<div class="flex justify-between gap-2">
							<div class="text-left">
								<div
									class="text-nowrap text-2xl leading-none font-bold text-old-neutral-950"
								>
									{{ formatDateShort(flight.departureDate) }}
								</div>
								<div
									class="mt-1 text-sm leading-none font-semibold text-old-neutral-800"
								>
									{{ flight.origin }}
								</div>
							</div>

							<div class="flex grow flex-col items-center px-2">
								<div class="basis-1/2 text-sm text-old-neutral-800">
									{{ getDurationInDays(flight.departureDate, flight.returnDate) }}
									{{
										getDurationInDays(flight.departureDate, flight.returnDate) ===
										1
											? "day"
											: "days"
									}}
								</div>
								<USeparator />
							</div>

							<div class="text-right">
								<div
									class="text-nowrap text-2xl leading-none font-bold text-old-neutral-950"
								>
									{{ formatDateShort(flight.returnDate) }}
								</div>
								<span
									class="mt-1 text-right text-sm leading-none font-semibold text-old-neutral-800"
								>
									{{ flight.destination }}
								</span>
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end justify-center">
						<div class="text-sm text-old-neutral-800">Flight from:</div>
						<div class="text-3xl font-bold text-old-neutral-950">
							{{ formatPrice(flight.price.amount, flight.price.currency) }}
						</div>
					</div>
				</div>

				<div
					v-if="flight.seatAvailability < 3"
					class="-mx-4 -mb-4 bg-red-100 p-0.5 text-center text-sm leading-none text-red-700 sm:mt-1.5 sm:mx-0 sm:ml-auto sm:w-fit sm:rounded-full sm:px-2 sm:py-1"
				>
					Only {{ flight.seatAvailability }}
					{{ flight.seatAvailability === 1 ? "seat" : "seats" }}
					available
				</div>
			</UCard>
		</li>
	</ul>
</template>
