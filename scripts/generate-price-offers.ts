import { faker } from "@faker-js/faker";
import { $ } from "bun";

type PriceOffer = {
	origin: string;
	destination: string;
	departureDate: string;
	returnDate: string;
	seatAvailability: number;
	price: {
		amount: number;
		currency: "EUR";
	};
	offerType: "amadeusBestPrice";
	uuid: string;
};

const AIRPORTS = [
	"CGN",
	"BER",
	"HAM",
	"MUC",
	"DUS",
	"FRA",
	"STR",
	"PMI",
	"LHR",
	"VIE",
];

function pickDestination(origin: string): string {
	const destinations = AIRPORTS.filter((code) => code !== origin);
	return faker.helpers.arrayElement(destinations);
}

function makeOffer(): PriceOffer {
	const origin = faker.helpers.arrayElement(AIRPORTS);
	const destination = pickDestination(origin);
	const departureDate = faker.date.soon({ days: 30 });
	const returnDate = faker.date.soon({ days: 14, refDate: departureDate });

	return {
		origin,
		destination,
		departureDate: departureDate.toISOString().slice(0, 10),
		returnDate: returnDate.toISOString().slice(0, 10),
		seatAvailability: faker.number.int({ min: 1, max: 9 }),
		price: {
			amount: Number(faker.finance.amount({ min: 39, max: 349, dec: 2 })),
			currency: "EUR",
		},
		offerType: "amadeusBestPrice",
		uuid: faker.string.uuid(),
	};
}

async function main() {
	const count = 50;
	const offers: PriceOffer[] = Array.from({ length: count }, makeOffer);
	const output = "/data/price-offers.json";

	await $`mkdir -p ${`${process.cwd()}/data`}`;
	await Bun.write(`${process.cwd()}${output}`, JSON.stringify(offers, null, 2));

	console.log(`Generated ${count} offers at ${output}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
