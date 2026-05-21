export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  currency: string;
  bookingUrl: string;
}

export async function searchFlights(origin: string, destination: string, date: string): Promise<Flight[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const airlines = [
    'Delta', 'United', 'American Airlines', 'Lufthansa', 
    'British Airways', 'Emirates', 'Air France', 'Singapore Airlines'
  ];
  
  const getRandomTime = () => {
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const numFlights = Math.floor(Math.random() * 5) + 3;
  const flights: Flight[] = [];

  for (let i = 0; i < numFlights; i++) {
    const price = Math.floor(Math.random() * (1200 - 300) + 300);
    const airline = airlines[Math.floor(Math.random() * airlines.length)];

    flights.push({
      id: `flight-${i + 1}`,
      airline,
      from: origin,
      to: destination,
      departure: getRandomTime(),
      arrival: getRandomTime(),
      price,
      currency: 'USD',
      bookingUrl: `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${date}`
    });
  }

  return flights.sort((a, b) => a.price - b.price);
}