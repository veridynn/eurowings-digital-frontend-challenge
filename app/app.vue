<script setup lang="ts">
import { de } from "@nuxt/ui/locale";

const {
	data: flights,
	pending,
	error,
} = await useFetch<Flight[]>("/api/flights", {
	default: () => [],
});

useFlightState(flights);
</script>

<template>
	<UApp :locale="de">
		<Header />
		<UMain class="bg-old-neutral-50">
			<UContainer class="pt-6">
				<Filters />
			</UContainer>

			<UContainer class="py-2.5">
				<div class="mx-auto max-w-xl space-y-4 text-center">
					<Toolbar v-if="!pending" />
					<List :flights="flights" :pending="pending" :error="error" />
				</div>
			</UContainer>
		</UMain>
	</UApp>
</template>
