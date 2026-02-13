import { readFile } from "node:fs/promises";

const dataFilePath = `${process.cwd()}/data/flights.json`;

export default defineEventHandler(async (): Promise<Flight[]> => {
	const raw = await readFile(dataFilePath, "utf-8");
	return JSON.parse(raw) as Flight[];
});
