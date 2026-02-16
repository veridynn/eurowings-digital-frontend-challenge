export type Flight = {
	origin: string;
	destination: string;
	departureDate: string;
	returnDate: string;
	seatAvailability: number;
	price: {
		amount: number;
		currency: string;
	};
	uuid: string;
};
