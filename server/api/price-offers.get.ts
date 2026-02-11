import { readFile } from "node:fs/promises";

const dataFilePath = `${process.cwd()}/data/price-offers.json`;

export default defineEventHandler(async (): Promise<PriceOffer[]> => {
	const raw = await readFile(dataFilePath, "utf-8");
	return JSON.parse(raw) as PriceOffer[];
});
