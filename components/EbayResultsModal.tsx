import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useState, useEffect } from 'react';
import { EbayItem, searchEbay, isEbayConfigured } from '../utils/ebayApiService';

interface EbayResultsModalProps {
  visible: boolean;
  vehicleText: string;
  onClose: () => void;
}

export default function EbayResultsModal({
  visible,
  vehicleText,
  onClose,
}: EbayResultsModalProps): JSX.Element {
  const [items, setItems] = useState<EbayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [excludeList, setExcludeList] = useState<string[]>([]);

  // Search when modal opens or vehicle text changes
  useEffect(() => {
    if (visible && vehicleText) {
      performSearch();
    }
  }, [visible, vehicleText]);

  const performSearch = async (): Promise<void> => {
    if (!isEbayConfigured()) {
      setError('eBay API credentials not configured. Please update ebayApiService.ts');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: EbayItem[] = await searchEbay(vehicleText, excludeList, 20);
      setItems(results);

      if (results.length === 0) {
        setError('No items found matching your search criteria.');
      }
    } catch (err: unknown) {
      const errorMessage: string = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('eBay search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add word to exclusion list
  const addToExcludeList = (word: string): void => {
    if (!excludeList.includes(word)) {
      setExcludeList([...excludeList, word]);
    }
  };

  // Remove word from exclusion list
  const removeFromExcludeList = (word: string): void => {
    setExcludeList(excludeList.filter((w: string) => w !== word));
  };

  // Tokenize a title into clickable words
  const tokenizeTitle = (title: string): Array<{ word: string; isExcluded: boolean }> => {
    return title
      .split(/\s+/)
      .map((word: string) => {
        // Clean the word but preserve original for display
        const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
        return {
          word: word, // Original word with punctuation for display
          isExcluded: excludeList.includes(cleanWord),
        };
      });
  };

  // Toggle word in exclusion list
  const toggleWordExclusion = (word: string, event: any): void => {
    // Prevent opening eBay link
    event.stopPropagation();

    const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '');
    if (cleanWord.length <= 2) return; // Ignore very short words

    if (excludeList.includes(cleanWord)) {
      removeFromExcludeList(cleanWord);
    } else {
      addToExcludeList(cleanWord);
    }
  };

  const openEbayListing = (url: string): void => {
    Linking.openURL(url).catch((err: Error) => {
      console.error('Failed to open eBay listing:', err);
    });
  };

  const formatPrice = (price: { value: string; currency: string }): string => {
    return `$${parseFloat(price.value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>eBay Search Results</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Search query display */}
        <View style={styles.searchInfo}>
          <Text style={styles.searchLabel}>Searching for:</Text>
          <Text style={styles.searchQuery}>{vehicleText}</Text>
        </View>

        {/* Exclusion List */}
        <View style={styles.excludeSection}>
          <Text style={styles.excludeLabel}>Excluded Words:</Text>
          {excludeList.length > 0 ? (
            <View style={styles.tagContainer}>
              {excludeList.map((word: string) => (
                <TouchableOpacity
                  key={word}
                  style={styles.excludedTag}
                  onPress={(): void => removeFromExcludeList(word)}
                >
                  <Text style={styles.excludedTagText}>{word}</Text>
                  <Text style={styles.excludedTagX}> ×</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
                <Text style={styles.searchButtonText}>Re-search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.emptyText}>Click words below to exclude them</Text>
          )}
        </View>


        {/* Loading state */}
        {loading && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0064d2" />
            <Text style={styles.loadingText}>Searching eBay...</Text>
          </View>
        )}

        {/* Error state */}
        {error && !loading && (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Results list */}
        {!loading && !error && items.length > 0 && (
          <ScrollView style={styles.resultsScroll}>
            <Text style={styles.resultsCount}>Found {items.length} items (sorted by price)</Text>
            {items.map((item: EbayItem) => (
              <TouchableOpacity
                key={item.itemId}
                style={styles.itemCard}
                onPress={(): void => openEbayListing(item.itemWebUrl)}
              >
                {item.image?.imageUrl && (
                  <Image source={{ uri: item.image.imageUrl }} style={styles.itemImage} />
                )}
                <View style={styles.itemInfo}>
                  <View style={styles.titleContainer}>
                    {tokenizeTitle(item.title).map((token: { word: string; isExcluded: boolean }, index: number) => (
                      <TouchableOpacity
                        key={index}
                        onPress={(e): void => toggleWordExclusion(token.word, e)}
                        style={[
                          styles.wordChip,
                          token.isExcluded && styles.wordChipExcluded,
                        ]}
                      >
                        <Text
                          style={[
                            styles.wordChipText,
                            token.isExcluded && styles.wordChipTextExcluded,
                          ]}
                        >
                          {token.word}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  {item.condition && (
                    <Text style={styles.itemCondition}>Condition: {item.condition}</Text>
                  )}
                  {item.seller && (
                    <Text style={styles.itemSeller}>
                      Seller: {item.seller.username} ({item.seller.feedbackPercentage}% positive)
                    </Text>
                  )}
                  {item.shippingOptions?.[0]?.shippingCost && (
                    <Text style={styles.itemShipping}>
                      Shipping: {formatPrice(item.shippingOptions[0].shippingCost)}
                    </Text>
                  )}
                  <Text style={styles.tapHint}>Tap to view on eBay</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 30,
    color: '#333',
    fontWeight: 'bold',
  },
  searchInfo: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  searchQuery: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  excludeSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  excludeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  excludedTag: {
    flexDirection: 'row',
    backgroundColor: '#ff4444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  excludedTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  excludedTagX: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0064d2',
    borderRadius: 16,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
  },
  resultsScroll: {
    flex: 1,
  },
  resultsCount: {
    padding: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f8f8f8',
  },
  itemCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  wordChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wordChipExcluded: {
    backgroundColor: '#ff4444',
  },
  wordChipText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  wordChipTextExcluded: {
    color: '#fff',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0064d2',
    marginBottom: 5,
  },
  itemCondition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  itemSeller: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  itemShipping: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  tapHint: {
    fontSize: 10,
    color: '#0064d2',
    fontStyle: 'italic',
    marginTop: 5,
  },
});
