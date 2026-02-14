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
</script>

<template>
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
						color="primary"
						icon="i-lucide-plane-takeoff"
						:ui="{ trailingIcon: 'hidden' }"
						autocomplete="on"
						open-on-focus
						clear
						class="basis-3xs grow"
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

				<UButton
					type="submit"
					size="xl"
					class="basis-3xs shrink grow justify-center font-semibold"
					:ui="{
						base: 'bg-gradient-to-r from-magenta to-magenta-dark',
					}"
				>
					Filter flights
				</UButton>
			</div>
		</form>
	</UCard>
</template>
