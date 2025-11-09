// PetDetailsScreen.js
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getPetfinderToken } from '../../config/petfinder';

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams(); // get ID from the route
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getPetfinderToken();
      if (!token) {
        console.warn('No token');
        return;
      }
      try {
        const res = await fetch(`https://api.petfinder.com/v2/animals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.animal) {
          setPet(data.animal);
        } else {
          console.warn('No animal data', data);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />
    );
  }

  if (!pet) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Pet Details Available</Text>
      </View>
    );
  }

  const imageUri = pet.photos?.[0]?.large || 'https://place-puppy.com/600x400';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.badge}>Available for Adoption</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Age: </Text>
          <Text>{pet.age}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gender: </Text>
          <Text>{pet.gender}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Breed: </Text>
          <Text>{pet.breeds?.primary}</Text>
        </View>

        <Text style={styles.sectionTitle}>About {pet.name}</Text>
        <Text style={styles.paragraph}>
          {pet.description || 'No description available.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300 },
  content: { padding: 16 },
  name: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  badge: {
    backgroundColor: '#DFF6DD',
    color: '#2E8B57',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  row: { flexDirection: 'row', marginVertical: 2 },
  label: { fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 5 },
  paragraph: { lineHeight: 20, color: '#444' },
});
