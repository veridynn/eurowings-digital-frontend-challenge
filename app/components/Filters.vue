<script setup lang="ts">
const {
	form,
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
	applyFilters,
} = useFlightState();

const inputDateUi = {
	segment:
		"text-old-neutral-900 data-placeholder:text-old-neutral-700 dark:data-placeholder:text-old-neutral-200",
};

const commitOriginFromInput = () => {
	const selectedValue = form.value.origin?.trim() ?? "";
	const searchValue = originSearchTerm.value.trim();
	const value = selectedValue || searchValue;

	form.value.origin = value || undefined;
	originSearchTerm.value = value;
};

const commitDestinationFromInput = () => {
	const selectedValue = form.value.destination?.trim() ?? "";
	const searchValue = destinationSearchTerm.value.trim();
	const value = selectedValue || searchValue;

	form.value.destination = value || undefined;
	destinationSearchTerm.value = value;
};

onMounted(() => {
	(window as Window & { __E2E_FILTER_HOOK_READY?: boolean }).__E2E_FILTER_HOOK_READY =
		true;

	const handleE2eSetFilters = (
		event: CustomEvent<{ origin?: string; destination?: string }>,
	) => {
		if (event.detail.origin !== undefined) {
			form.value.origin = event.detail.origin || undefined;
		}

		if (event.detail.destination !== undefined) {
			form.value.destination = event.detail.destination || undefined;
		}
	};

	window.addEventListener(
		"e2e:set-filters",
		handleE2eSetFilters as EventListener,
	);

	onBeforeUnmount(() => {
		window.removeEventListener(
			"e2e:set-filters",
			handleE2eSetFilters as EventListener,
		);
		delete (window as Window & { __E2E_FILTER_HOOK_READY?: boolean })
			.__E2E_FILTER_HOOK_READY;
	});
});
</script>

<template>
	<UCard>
		<form class="space-y-4" @submit.prevent="applyFilters">
			<fieldset class="space-y-4">
				<legend class="sr-only">Flight search filters</legend>

				<div class="flex flex-wrap gap-4">
					<UFormField label="Departure airport" class="basis-3xs grow">
						<UInputMenu
							id="filter-origin"
							v-model="form.origin"
							v-model:search-term="originSearchTerm"
							:items="airports"
							placeholder="Departure airport"
							size="xl"
							color="primary"
							icon="i-lucide-plane-takeoff"
							:ui="{ trailingIcon: 'hidden' }"
							autocomplete="on"
							open-on-focus
							open-on-click
							create-item
							@blur="commitOriginFromInput"
							clear
							class="w-full"
						/>
					</UFormField>

					<UFormField label="Destination airport" class="basis-3xs grow">
						<UInputMenu
							id="filter-destination"
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
							open-on-click
							create-item
							@blur="commitDestinationFromInput"
							clear
							class="w-full"
						/>
					</UFormField>
				</div>

				<div class="flex flex-wrap gap-4">
					<UFormField label="Outgoing flight" name="departureDate" class="basis-3xs grow">
						<UInputDate
							id="filter-departure-date"
							v-model="departureDateValue"
							:min-value="todayDate"
							:max-value="departureMaxDate"
							name="departureDate"
							granularity="day"
							size="xl"
							color="primary"
							:ui="inputDateUi"
							class="w-full"
						>
							<template #leading>
								<UPopover v-model:open="departureCalendarOpen">
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
											@update:model-value="departureCalendarOpen = false"
											:min-value="todayDate"
											:max-value="departureMaxDate"
											class="p-2"
										/>
									</template>
								</UPopover>
							</template>
						</UInputDate>
					</UFormField>

					<UFormField label="Return flight" name="returnDate" class="basis-3xs grow">
						<UInputDate
							id="filter-return-date"
							v-model="returnDateValue"
							:min-value="returnMinDate"
							:max-value="returnMaxDate"
							name="returnDate"
							granularity="day"
							size="xl"
							color="primary"
							:ui="inputDateUi"
							class="w-full"
						>
							<template #leading>
								<UPopover v-model:open="returnCalendarOpen">
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
											@update:model-value="returnCalendarOpen = false"
											:min-value="returnMinDate"
											:max-value="returnMaxDate"
											class="p-2"
										/>
									</template>
								</UPopover>
							</template>
						</UInputDate>
					</UFormField>

					<UButton
						type="submit"
						size="xl"
						class="basis-3xs shrink grow justify-center self-end font-semibold"
						:ui="{
							base: 'bg-gradient-to-r from-magenta to-magenta-dark',
						}"
					>
						Filter flights
					</UButton>
				</div>
			</fieldset>
		</form>
	</UCard>
</template>
