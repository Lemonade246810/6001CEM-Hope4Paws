import { arrayUnion, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function saveAdoptedPet(userId, pet) {
  try {
    const userPetsRef = doc(db, "UserPets", userId);

    await setDoc(
      userPetsRef,
      {
        adoptedPets: arrayUnion({
          petId: pet.id,
          petName: pet.name,
          petImage: pet.imageUrl,
          species: pet.species,
          adoptedAt: serverTimestamp(),
        }),
      },
      { merge: true }
    );

    console.log("✅ Adopted pet saved to UserPets!");
  } catch (error) {
    console.log("❌ Error saving adopted pet:", error);
  }
}
