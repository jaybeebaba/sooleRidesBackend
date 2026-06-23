export type Ride = {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;

  driver?: {
    id: string;
    fullName?: string;
    phone?: string;
  };

  vehicle?: {
    id?: string;
    brand?: string;
    model?: string;
    color?: string;
    plateNumber?: string;
  };
};

export type PopularRoute = {
  origin: string;
  destination: string;
  rideCount: number;
  averagePrice: number;
};