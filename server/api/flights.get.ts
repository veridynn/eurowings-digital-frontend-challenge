import flightsData from "~~/data/flights.json";

export default defineEventHandler((): Flight[] => {
	return flightsData as Flight[];
});
