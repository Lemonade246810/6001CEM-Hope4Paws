import { useState } from "react";
import { View } from "react-native";
import Category from "./Category";
import FeaturedPets from "./FeaturedPets";

export default function PetListByCategory() {
  const [selectedCategory, setSelectedCategory] = useState("Cat");

  return (
    <View>
      <Category
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <FeaturedPets selectedCategory={selectedCategory} />
    </View>
  );
}
