import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { InventoryRow } from '../types/supabase';
import {
  getInventoryItems,
  searchInventoryItems,
  deleteInventoryItem,
  filterInventoryByCategory,
} from '../services/inventory';

interface InventoryScreenProps {
  onBack: () => void;
}

type SortOption = 'newest' | 'oldest' | 'expiring' | 'name';
type FilterCategory = string | null;

export default function InventoryScreen({ onBack }: InventoryScreenProps) {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedCategories, setSelectedCategories] = useState<FilterCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load inventory on mount
  useEffect(() => {
    loadInventory();
  }, []);

  // Apply search, filter, and sort when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [inventory, searchQuery, sortOption, selectedCategories]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const items = await getInventoryItems();
      setInventory(items);
      setFilteredInventory(items);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      applyFiltersAndSort();
      return;
    }

    try {
      const results = await searchInventoryItems(query);
      setFilteredInventory(results);
      
      // Add to recent searches if not empty and not already in list
      if (query.trim() && !recentSearches.includes(query.trim())) {
        setRecentSearches([query.trim(), ...recentSearches].slice(0, 5));
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(query) ||
          item.barcode?.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    if (selectedCategories.length > 0 && !selectedCategories.includes(null)) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes(item.category)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'expiring':
          if (!a.expiry_date || !b.expiry_date) return 0;
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        case 'name':
          return (a.product_name || '').localeCompare(b.product_name || '');
        default:
          return 0;
      }
    });

    setFilteredInventory(filtered);
  };

  const handleDelete = (item: InventoryRow) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.product_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInventoryItem(item.id);
              await loadInventory();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const getUniqueCategories = (): string[] => {
    const categories = inventory
      .map((item) => item.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined);
    return Array.from(new Set(categories));
  };

  const formatExpiryDate = (dateString: string | null): string => {
    if (!dateString) return 'No expiry date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilExpiry = (dateString: string | null): number | null => {
    if (!dateString) return null;
    const expiry = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (dateString: string | null): { color: string; text: string } => {
    const days = getDaysUntilExpiry(dateString);
    if (days === null) return { color: '#666', text: 'No expiry date' };
    if (days < 0) return { color: '#FF3B30', text: 'Expired' };
    if (days === 0) return { color: '#FF9500', text: 'Expires today' };
    if (days <= 3) return { color: '#FF9500', text: `Expires in ${days} days` };
    return { color: '#34C759', text: `Expires in ${days} days` };
  };

  const renderItem = ({ item }: { item: InventoryRow }) => {
    const expiryStatus = getExpiryStatus(item.expiry_date);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onLongPress={() => handleDelete(item)}
      >
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImageIcon}>📦</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product_name || 'Unknown Product'}</Text>
          <Text style={styles.expiryDate}>
            Expire at {formatExpiryDate(item.expiry_date)}
          </Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        <View style={[styles.expiryStatus, { backgroundColor: expiryStatus.color + '20' }]}>
          <Text style={[styles.expiryStatusText, { color: expiryStatus.color }]}>
            {expiryStatus.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              handleSearch('');
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Searches */}
      {searchQuery === '' && recentSearches.length > 0 && (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>RECENT SEARCHES</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleSearch(search)}
            >
              <Text style={styles.recentSearchText}>{search}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRecentSearches(recentSearches.filter((_, i) => i !== index));
                }}
              >
                <Text style={styles.removeSearchText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sort and Filter Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            const options: SortOption[] = ['newest', 'oldest', 'expiring', 'name'];
            const currentIndex = options.indexOf(sortOption);
            const nextIndex = (currentIndex + 1) % options.length;
            setSortOption(options[nextIndex]);
          }}
        >
          <Text style={styles.controlButtonText}>Sort ↕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.controlButtonText}>Filter</Text>
          {selectedCategories.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedCategories.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {filteredInventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'Start scanning products to add them here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={loadInventory}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategories([]);
                  setShowFilters(false);
                }}
              >
                <Text style={styles.modalButton}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                {selectedCategories.filter((c) => c !== null).length > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>
                      {selectedCategories.filter((c) => c !== null).length}
                    </Text>
                  </View>
                )}
                {getUniqueCategories().map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.filterOption}
                    onPress={() => {
                      if (selectedCategories.includes(category)) {
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== category)
                        );
                      } else {
                        setSelectedCategories([...selectedCategories, category]);
                      }
                    }}
                  >
                    <Text style={styles.filterOptionText}>{category}</Text>
                    {selectedCategories.includes(category) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 10,
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
  },
  recentSearchesContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  recentSearchesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  recentSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentSearchText: {
    fontSize: 16,
    color: '#000',
  },
  removeSearchText: {
    fontSize: 16,
    color: '#666',
    padding: 5,
  },
  controlsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 15,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  controlButtonText: {
    fontSize: 16,
    color: '#000',
  },
  filterBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImageIcon: {
    fontSize: 40,
  },
  productInfo: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  expiryStatus: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  expiryStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  filterContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#000',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
