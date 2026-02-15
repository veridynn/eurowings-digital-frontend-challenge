import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const fixturePath = process.env.E2E_FLIGHTS_FIXTURE_PATH;
const dataFilePath = fixturePath
	? resolve(process.cwd(), fixturePath)
	: `${process.cwd()}/data/flights.json`;

export default defineEventHandler(async (): Promise<Flight[]> => {
	const raw = await readFile(dataFilePath, "utf-8");
	return JSON.parse(raw) as Flight[];
});
