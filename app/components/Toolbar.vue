<script setup lang="ts">
const {
	activeFilterChips,
	removeFilter,
	resetFilters,
	selectedSort,
	sortOptions,
	selectedSortOption,
} = useFlightState();
</script>

<template>
	<div class="flex flex-col gap-3 text-left sm:flex-row sm:items-center">
		<div class="min-w-0 w-full overflow-hidden sm:flex-1">
			<div class="flex items-center gap-2">
				<template v-if="activeFilterChips.length">
					<div class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap pb-1">
						<div class="flex items-center gap-2">
							<UButton
								v-for="chip in activeFilterChips"
								:key="chip.key"
								color="neutral"
								variant="soft"
								size="sm"
								trailing-icon="i-lucide-x"
								class="shrink-0 whitespace-nowrap"
								@click="removeFilter(chip.key)"
							>
								{{ chip.label }}
							</UButton>
						</div>
					</div>

					<UButton
						color="neutral"
						variant="ghost"
						size="sm"
						icon="i-lucide-funnel-x"
						class="shrink-0 whitespace-nowrap"
						@click="resetFilters"
					>
						Clear all
					</UButton>
				</template>

				<p v-else class="text-sm text-old-neutral-700">No active filters</p>
			</div>
		</div>

		<UFormField
			label="Sort flights"
			name="sort"
			:ui="{
				label: 'sr-only',
				container: 'w-full',
			}"
			class="w-full sm:w-40 sm:shrink-0"
		>
			<USelect
				id="sort-flights"
				v-model="selectedSort"
				:items="sortOptions"
				name="sort"
				aria-label="Sort flights"
				size="sm"
				color="primary"
				variant="outline"
				class="w-full"
			>
				<template #leading>
					<UIcon v-if="selectedSortOption?.icon" :name="selectedSortOption.icon" />
				</template>
			</USelect>
		</UFormField>
	</div>
</template>
