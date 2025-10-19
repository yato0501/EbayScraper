import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Vehicle } from '../utils/vehicleParser';
import EbayResultsModal from './EbayResultsModal';

interface EditableVehicleListProps {
  vehicles: Vehicle[];
  onVehiclesChange: (vehicles: Vehicle[]) => void;
}

export default function EditableVehicleList({ vehicles, onVehiclesChange }: EditableVehicleListProps): JSX.Element {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEbayModal, setShowEbayModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const handleEdit = (index: number, newText: string): void => {
    const updatedVehicles: Vehicle[] = [...vehicles];
    updatedVehicles[index] = {
      ...updatedVehicles[index],
      fullText: newText,
    };
    onVehiclesChange(updatedVehicles);
  };

  const handleDelete = (index: number): void => {
    const updatedVehicles: Vehicle[] = vehicles.filter((_: Vehicle, i: number) => i !== index);
    onVehiclesChange(updatedVehicles);
  };

  const openEbaySearch = (vehicleText: string): void => {
    setSelectedVehicle(vehicleText);
    setShowEbayModal(true);
  };

  if (vehicles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No vehicles detected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detected Vehicles ({vehicles.length}):</Text>
      <Text style={styles.subtitle}>Tap to edit, press Delete to remove</Text>

      <EbayResultsModal
        visible={showEbayModal}
        vehicleText={selectedVehicle}
        onClose={(): void => setShowEbayModal(false)}
      />

      <ScrollView style={styles.scrollView}>
        {vehicles.map((vehicle: Vehicle, index: number) => (
          <View key={index} style={styles.vehicleItem}>
            <View style={styles.vehicleContent}>
              <Text style={styles.indexNumber}>{index + 1}.</Text>
              <TextInput
                style={styles.vehicleInput}
                value={vehicle.fullText}
                onChangeText={(text: string): void => handleEdit(index, text)}
                onFocus={(): void => setEditingIndex(index)}
                onBlur={(): void => setEditingIndex(null)}
                multiline={false}
              />
            </View>
            <TouchableOpacity
              style={styles.ebayButton}
              onPress={(): void => openEbaySearch(vehicle.fullText)}
            >
              <Text style={styles.ebayButtonText}>eBay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(): void => handleDelete(index)}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  scrollView: {
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vehicleContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indexNumber: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    minWidth: 25,
  },
  vehicleInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  ebayButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#0064d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ebayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
