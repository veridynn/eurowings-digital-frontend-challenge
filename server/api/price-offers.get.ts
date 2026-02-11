import { readFile } from 'node:fs/promises'

type PriceOffer = {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  seatAvailability: number
  price: {
    amount: number
    currency: 'EUR'
  }
  offerType: string
  uuid: string
}

const dataFilePath = `${process.cwd()}/data/price-offers.json`

export default defineEventHandler(async (): Promise<PriceOffer[]> => {
  const raw = await readFile(dataFilePath, 'utf-8')
  return JSON.parse(raw) as PriceOffer[]
})
