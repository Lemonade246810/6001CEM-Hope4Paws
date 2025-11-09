import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseConfig';

export default function Category({ selectedCategory, setSelectedCategory }) {

  const [categoryList, setCategoryList] = useState([]);

  // 🔥 Mapping UI label -> Firestore species
  const mapCategoryToSpecies = {
    Cats: "Cat",
    Dogs: "Dog",
  };

  useEffect(() => {
    GetCategories();
  }, []);

  const GetCategories = async () => {
    setCategoryList([]);
    const snapshot = await getDocs(collection(db, 'Category'));
    snapshot.forEach((doc) => {
      setCategoryList(prev => [...prev, doc.data()]);
    });
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontFamily: 'roboto-medium', fontSize: 22 }}>
        Category
      </Text>

      <FlatList
        data={categoryList}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(mapCategoryToSpecies[item.name])}
            style={{ flex: 1 }}
          >
            <View style={[
              styles.container,
              selectedCategory === mapCategoryToSpecies[item.name] &&
              styles.selectedCategoryContainer
            ]}>
              <Image
                source={{ uri: item?.imageUrl }}
                style={{ width: 40, height: 40 }}
              />
            </View>
            <Text style={{ textAlign: 'center', fontFamily: 'roboto-regular' }}>
              {item?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fae7b1',
    padding: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    borderColor: '#fcd56a',
    margin: 5
  },
  selectedCategoryContainer: {
    backgroundColor: '#fcc221',
    borderColor: '#bf8d04'
  }
});
