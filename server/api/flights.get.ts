import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const dataFilePath = resolve(process.cwd(), "data/flights.json");

export default defineEventHandler(async (): Promise<Flight[]> => {
	const raw = await readFile(dataFilePath, "utf-8");
	return JSON.parse(raw) as Flight[];
});
