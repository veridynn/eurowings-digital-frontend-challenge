export type PriceOffer = {
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
