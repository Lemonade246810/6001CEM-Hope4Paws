/**
 * Shared sorting function for admin collections.
 * Supports createdAt, alphabetical, and status sorting.
 * 
 * @param {Array} data - List of items (from Firestore)
 * @param {String} sortBy - Sorting option (Newest, Oldest, A-Z, Z-A, Status)
 * @param {String} [key='createdAt'] - Key used for date sorting
 */
export const sortCollection = (data, sortBy, key = "createdAt") => {
  return [...data].sort((a, b) => {
    if (sortBy === "Newest") return (b[key] ? new Date(b[key]) : 0) - (a[key] ? new Date(a[key]) : 0);
    if (sortBy === "Oldest") return (a[key] ? new Date(a[key]) : 0) - (b[key] ? new Date(b[key]) : 0);
    
    if (sortBy === "A-Z") {
      const aName = a.name || a.petName || a.animalType || "";
      const bName = b.name || b.petName || b.animalType || "";
      return aName.localeCompare(bName);
    }
    if (sortBy === "Z-A") {
      const aName = a.name || a.petName || a.animalType || "";
      const bName = b.name || b.petName || b.animalType || "";
      return bName.localeCompare(aName);
    }

    if (sortBy === "Status") {
      const aStatus = a.status || "";
      const bStatus = b.status || "";
      return aStatus.localeCompare(bStatus);
    }

    return 0;
  });
};