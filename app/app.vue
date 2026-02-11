<template>
	<NuxtRouteAnnouncer />

	<h1>Price Offers</h1>

	<p v-if="pending">Loading offers...</p>
	<p v-else-if="error">Failed to load offers.</p>

	<ul v-else>
		<li v-for="offer in offers" :key="offer.uuid">
			{{ offer.origin }} -> {{ offer.destination }} |
			{{ offer.departureDate }} to {{ offer.returnDate }} |
			{{ offer.price.amount }} {{ offer.price.currency }} | seats:
			{{ offer.seatAvailability }}
		</li>
	</ul>
</template>

<script setup lang="ts">
const {
	data: offers,
	pending,
	error,
} = await useFetch<PriceOffer[]>("/api/price-offers", {
	default: () => [],
});
</script>
