export const PETFINDER_API_KEY = '3nH4NKvSo2IwfXlINZ5Tcs6npMi0FQOda8r71rxAePBCNf5P2i';
export const PETFINDER_SECRET = 'In6onIqKjtsAFqyyjHy4Fy6xW6n4HHCDcNbzrWex';

// Function to get Petfinder OAuth token
export const getPetfinderToken = async () => {
  try {
    const res = await fetch('https://api.petfinder.com/v2/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${PETFINDER_API_KEY}&client_secret=${PETFINDER_SECRET}`,
    });
    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error('Error fetching Petfinder token:', err);
    return null;
  }
};
