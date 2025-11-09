import { useLocalSearchParams } from 'expo-router';
import AdoptionScreen from './AdoptionScreen';

export default function PetDetails() {
  const { id } = useLocalSearchParams(); // receives pet ID from router.push
  return <AdoptionScreen petId={id} />;
}