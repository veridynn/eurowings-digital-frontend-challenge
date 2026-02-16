import type { Flight } from "#shared/types/flight";

export const testFlights: Flight[] = [
	{
		uuid: "flight-a",
		origin: "BER",
		destination: "LHR",
		departureDate: "2030-06-10",
		returnDate: "2030-06-12",
		seatAvailability: 4,
		price: {
			amount: 89,
			currency: "EUR",
		},
	},
	{
		uuid: "flight-b",
		origin: "MUC",
		destination: "VIE",
		departureDate: "2030-07-20",
		returnDate: "2030-07-27",
		seatAvailability: 2,
		price: {
			amount: 89,
			currency: "EUR",
		},
	},
	{
		uuid: "flight-c",
		origin: "CGN",
		destination: "PMI",
		departureDate: "2030-05-01",
		returnDate: "2030-05-05",
		seatAvailability: 1,
		price: {
			amount: 129.99,
			currency: "EUR",
		},
	},
	{
		uuid: "flight-d",
		origin: "HAM",
		destination: "DUS",
		departureDate: "2030-08-01",
		returnDate: "2030-08-03",
		seatAvailability: 9,
		price: {
			amount: 249,
			currency: "EUR",
		},
	},
];
