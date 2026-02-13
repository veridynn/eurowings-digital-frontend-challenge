<script setup lang="ts">
const {
	data: flights,
	pending,
	error,
} = await useFetch<PriceOffer[]>("/api/price-offers", {
	default: () => [],
});

const form = reactive({
	origin: undefined as string | undefined,
	destination: undefined as string | undefined,
	departureDate: "",
	returnDate: "",
});

const appliedFilters = ref({
	origin: undefined as string | undefined,
	destination: undefined as string | undefined,
	departureDate: "",
	returnDate: "",
});

const originSearchTerm = ref("");
const destinationSearchTerm = ref("");
const showOriginError = ref(false);

const airports = computed(() => {
	const airportSet = new Set<string>();

	for (const flight of flights.value) {
		airportSet.add(flight.origin);
		airportSet.add(flight.destination);
	}

	return [...airportSet].sort((a, b) => a.localeCompare(b));
});

const filteredFlights = computed(() => {
	const filters = appliedFilters.value;

	return flights.value.filter((flight) => {
		if (filters.origin && flight.origin !== filters.origin) {
			return false;
		}

		if (filters.destination && flight.destination !== filters.destination) {
			return false;
		}

		if (
			filters.departureDate &&
			flight.departureDate !== filters.departureDate
		) {
			return false;
		}

		if (filters.returnDate && flight.returnDate !== filters.returnDate) {
			return false;
		}

		return true;
	});
});

watch(
	() => form.origin,
	(origin) => {
		if (origin) {
			showOriginError.value = false;
		}
	},
);

const applyFilters = () => {
	if (!form.origin) {
		showOriginError.value = true;
		return;
	}

	showOriginError.value = false;
	appliedFilters.value = {
		origin: form.origin,
		destination: form.destination,
		departureDate: form.departureDate,
		returnDate: form.returnDate,
	};
};

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
	<UMain class="bg-old-neutral-50">
		<UContainer class="pt-6">
			<UCard>
				<form class="space-y-4" @submit.prevent="applyFilters">
					<div>
						<div class="flex flex-wrap gap-4">
							<UInputMenu
								v-model="form.origin"
								v-model:search-term="originSearchTerm"
								:items="airports"
								placeholder="Departure airport"
								size="xl"
								:color="showOriginError ? 'error' : 'primary'"
								:highlight="showOriginError"
								icon="i-lucide-plane-takeoff"
								:ui="{ trailingIcon: 'hidden' }"
								autocomplete="on"
								open-on-focus
								clear
								class="basis-3xs grow"
								:class="{
									'animate-shake': showOriginError,
								}"
							/>

							<UInputMenu
								v-model="form.destination"
								v-model:search-term="destinationSearchTerm"
								:items="airports"
								placeholder="Destination airport"
								size="xl"
								color="primary"
								icon="i-lucide-plane-landing"
								:ui="{ trailingIcon: 'hidden' }"
								autocomplete="on"
								open-on-focus
								clear
								class="basis-3xs grow"
							/>
						</div>
						<!-- TODO: figure out what the error states are and if they are needed -->
						<!-- <p
							class="mt-1 text-sm text-red-600"
							:class="{
								invisible: !showOriginError,
								'animate-shake': showOriginError,
							}"
						>
							Please select a departure airport.
						</p> -->
					</div>

					<div class="flex flex-wrap gap-4">
						<UInput
							v-model="form.departureDate"
							type="date"
							size="xl"
							color="primary"
							placeholder="Outgoing flight"
							icon="i-lucide-calendar"
							class="basis-3xs grow"
						/>

						<UInput
							v-model="form.returnDate"
							type="date"
							size="xl"
							color="primary"
							placeholder="Return flight"
							icon="i-lucide-calendar-plus"
							class="basis-3xs grow"
						/>

						<UButton
							type="submit"
							size="xl"
							class="basis-3xs shrink grow justify-center font-semibold"
							:disabled="showOriginError"
							:ui="{
								base: 'bg-gradient-to-r from-eurowings-magenta to-eurowings-magenta-dark',
							}"
						>
							Filter flights
						</UButton>
					</div>
				</form>
			</UCard>
		</UContainer>

		<UContainer class="py-2.5">
			<div class="mx-auto max-w-xl space-y-4 text-center">
				<UIcon
					v-if="pending"
					name="i-lucide-loader-circle"
					class="size-10 h-[calc(100vh-var(--ui-header-height))] animate-spin text-eurowings-magenta"
				/>

				<p v-else-if="error" class="text-red-600">Failed to load data.</p>

				<p v-else-if="!filteredFlights.length" class="text-old-neutral-700">
					No flights found for the selected filters.
				</p>

				<ul v-else class="space-y-4">
					<li v-for="flight in filteredFlights" :key="flight.uuid">
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
												{{
													getDurationInDays(
														flight.departureDate,
														flight.returnDate,
													)
												}}
												{{
													getDurationInDays(
														flight.departureDate,
														flight.returnDate,
													) === 1
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
										{{
											formatPrice(flight.price.amount, flight.price.currency)
										}}
									</div>
								</div>
							</div>

							<div
								v-if="flight.seatAvailability < 3"
								class="-mx-4 -mb-4 bg-red-100 p-0.5 text-center text-sm leading-none text-red-700 sm:mt-1.5 sm:-mx-0 sm:ml-auto sm:w-fit sm:rounded-full sm:px-2 sm:py-1"
							>
								Only {{ flight.seatAvailability }}
								{{ flight.seatAvailability === 1 ? "seat" : "seats" }} available
							</div>
						</UCard>
					</li>
				</ul>
			</div>
		</UContainer>
	</UMain>
</template>
