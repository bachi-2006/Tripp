const API_KEY = process.env.GEOAPIFY_API_KEY;

export async function getPlaces(location: string, categories: string = "catering.restaurant") {
  if (!API_KEY) return null;

  try {
    // 1. Geocode the location name to coordinates
    const geoRes = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&format=json&apiKey=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) return null;

    const { lat, lon } = geoData.results[0];

    // 2. Search for places nearby
    const placesRes = await fetch(
      `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},5000&limit=10&apiKey=${API_KEY}`
    );
    const placesData = await placesRes.json();

    return placesData.features.map((f: { properties: { name?: string; categories?: string[]; address_line2?: string } }) => ({
      name: f.properties.name || "Unknown Place",
      cuisine: f.properties.categories?.join(", ") || "Local",
      rating: 4.5, // Mock rating as Geoapify free tier might not have it
      price_range: "$$",
      description: f.properties.address_line2 || "Located in the heart of the city."
    }));

  } catch (error) {
    console.error("Geoapify Error:", error);
    return null;
  }
}