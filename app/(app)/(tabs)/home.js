import { useState } from "react";
import { FlatList, View } from "react-native";
import Header from "../../../components/Home/Header";
import PetListByCategory from "../../../components/Home/PetListByCategory";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Cats");

  return (
    <FlatList
      data={[1]} // dummy array to enable FlatList
      keyExtractor={() => "home-page"}
      renderItem={() => null} // nothing rendered inside
      ListHeaderComponent={
        <View style={{ padding: 20, marginTop: 25 }}>
          <Header />

          {/* Category Filter */}
          <PetListByCategory onCategoryChange={setSelectedCategory} />

        </View>
      }
    />
  );
}
