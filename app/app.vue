<script setup lang="ts">
const {
	data: offers,
	pending,
	error,
} = await useFetch<PriceOffer[]>("/api/price-offers", {
	default: () => [],
});

const formatDateShort = (dateValue: string) => {
	const date = new Date(dateValue);

	return new Intl.DateTimeFormat(navigator.language, {
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
	new Intl.NumberFormat(navigator.language, {
		style: "currency",
		currency,
	}).format(amount);
</script>

<template>
	<UMain class="bg-old-neutral-50">
		<UContainer class="py-2.5">
			<div class="mx-auto max-w-xl space-y-4 text-center">
				<UIcon
					v-if="pending"
					name="i-lucide-loader-circle"
					class="size-10 h-[calc(100vh-var(--ui-header-height))] text-center animate-spin bg-eurowings-magenta"
				/>

				<p v-else-if="error" class="text-red-600">Failed to load data.</p>

				<ul v-else class="space-y-4">
					<li v-for="offer in offers" :key="offer.uuid">
						<UCard class="shadow-lg">
							<div class="sm:flex sm:justify-between">
								<div
									class="flex flex-col justify-center sm:basis-1/2 after:h-px after:bg-old-neutral-200 after:w-auto after:-mx-4 sm:after:content-none"
								>
									<div class="flex justify-between gap-2">
										<div class="text-left">
											<div
												class="text-2xl text-old-neutral-950 text-nowrap font-bold leading-none"
											>
												{{ formatDateShort(offer.departureDate) }}
											</div>
											<div
												class="mt-1 text-sm font-semibold leading-none text-old-neutral-800"
											>
												{{ offer.origin }}
											</div>
										</div>

										<div class="flex flex-col grow px-2 items-center">
											<div class="basis-1/2 text-sm text-old-neutral-800">
												{{
													getDurationInDays(
														offer.departureDate,
														offer.returnDate,
													)
												}}
												{{
													getDurationInDays(
														offer.departureDate,
														offer.returnDate,
													) === 1
														? "day"
														: "days"
												}}
											</div>
											<USeparator />
											<!-- <hr class="w-full border-0 h-px bg-old-neutral-400" /> -->
										</div>

										<div class="text-right">
											<div
												class="text-2xl text-old-neutral-950 text-nowrap font-bold leading-none"
											>
												{{ formatDateShort(offer.returnDate) }}
											</div>
											<span
												class="mt-1 text-sm font-semibold leading-none text-old-neutral-800 text-right"
											>
												{{ offer.destination }}
											</span>
										</div>
									</div>
								</div>

								<div class="flex flex-col items-end justify-center">
									<div class="text-sm text-old-neutral-800">Flight from:</div>
									<div class="text-3xl text-old-neutral-950 font-bold">
										{{ formatPrice(offer.price.amount, offer.price.currency) }}
									</div>
								</div>
							</div>
							<!-- sm:w-auto! sm:m-0! sm:px-3 sm:py-1 inline-flex w-fit ml-auto-->
							<div
								v-if="offer.seatAvailability < 3"
								class="-mx-4 sm:-mx-0 -mb-4 sm:mt-1.5 p-0.5 sm:py-1 sm:px-2 bg-red-100 text-red-700 text-center text-sm leading-none sm:w-fit sm:ml-auto sm:rounded-full"
							>
								Only {{ offer.seatAvailability }}
								{{ offer.seatAvailability === 1 ? "seat" : "seats" }} available
							</div>
						</UCard>
					</li>
				</ul>
			</div>
		</UContainer>
	</UMain>
</template>
