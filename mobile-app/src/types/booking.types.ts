export type Booking = {
  id: string;
  status: string;
  seatsBooked: number;
  totalAmount: number;

  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  } | null;

  ride?: {
    id: string;
    origin: string;
    destination: string;
    departureTime: string;
  };
};