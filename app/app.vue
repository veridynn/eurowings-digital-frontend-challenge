<script setup lang="ts">
import {
	getLocalTimeZone,
	parseDate,
	today,
	type CalendarDate,
} from "@internationalized/date";

const {
	data: flights,
	pending,
	error,
} = await useFetch<Flight[]>("/api/flights", {
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
const departureDateValue = shallowRef<CalendarDate | undefined>(undefined);
const returnDateValue = shallowRef<CalendarDate | undefined>(undefined);

const toIsoDate = (date: CalendarDate | undefined) =>
	date ? date.toString() : "";

const toCalendarDate = (isoDate?: string) =>
	isoDate ? parseDate(isoDate) : undefined;

const todayDate = computed(() => today(getLocalTimeZone()));

const getLatestDateFromFlights = (dateSelector: (flight: Flight) => string) => {
	let latestDate = "";

	for (const flight of flights.value) {
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

const selectedDepartureDate = computed(() => departureDateValue.value);

const returnMinDate = computed(() => {
	const departureDate = selectedDepartureDate.value ?? todayDate.value;

	return departureDate.compare(todayDate.value) < 0
		? todayDate.value
		: departureDate;
});

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

departureDateValue.value = toCalendarDate(form.departureDate);
returnDateValue.value = toCalendarDate(form.returnDate);

watch(departureDateValue, (departureDate) => {
	const departureDateIso = toIsoDate(departureDate);

	if (form.departureDate !== departureDateIso) {
		form.departureDate = departureDateIso;
	}

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

		if (form.returnDate) {
			form.returnDate = "";
		}

		return;
	}

	const returnDateIso = toIsoDate(returnDate);

	if (form.returnDate !== returnDateIso) {
		form.returnDate = returnDateIso;
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

const resetFilters = () => {
	form.origin = undefined;
	form.destination = undefined;
	form.departureDate = "";
	form.returnDate = "";

	appliedFilters.value = {
		origin: undefined,
		destination: undefined,
		departureDate: "",
		returnDate: "",
	};

	originSearchTerm.value = "";
	destinationSearchTerm.value = "";
	showOriginError.value = false;
	departureDateValue.value = undefined;
	returnDateValue.value = undefined;
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
	<UApp>
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
							<UInputDate
								v-model="departureDateValue"
								:min-value="todayDate"
								:max-value="departureMaxDate"
								granularity="day"
								size="xl"
								color="primary"
								class="basis-3xs grow"
							>
								<template #leading>
									<UPopover>
										<UButton
											color="neutral"
											variant="link"
											size="xl"
											icon="i-lucide-calendar"
											aria-label="Select outgoing flight date"
											class="px-0"
										/>

										<template #content>
											<UCalendar
												v-model="departureDateValue"
												:min-value="todayDate"
												:max-value="departureMaxDate"
												class="p-2"
											/>
										</template>
									</UPopover>
								</template>
							</UInputDate>

							<UInputDate
								v-model="returnDateValue"
								:min-value="returnMinDate"
								:max-value="returnMaxDate"
								granularity="day"
								size="xl"
								color="primary"
								class="basis-3xs grow"
							>
								<template #leading>
									<UPopover>
										<UButton
											color="neutral"
											variant="link"
											size="xl"
											icon="i-lucide-calendar-plus"
											aria-label="Select return flight date"
											class="px-0"
										/>

										<template #content>
											<UCalendar
												v-model="returnDateValue"
												:min-value="returnMinDate"
												:max-value="returnMaxDate"
												class="p-2"
											/>
										</template>
									</UPopover>
								</template>
							</UInputDate>

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

					<div v-else-if="!filteredFlights.length" class="space-y-3">
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
									class="-mx-4 -mb-4 bg-red-100 p-0.5 text-center text-sm leading-none text-red-700 sm:mt-1.5 sm:mx-0 sm:ml-auto sm:w-fit sm:rounded-full sm:px-2 sm:py-1"
								>
									Only {{ flight.seatAvailability }}
									{{ flight.seatAvailability === 1 ? "seat" : "seats" }}
									available
								</div>
							</UCard>
						</li>
					</ul>
				</div>
			</UContainer>
		</UMain>
	</UApp>
</template>
