import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Vehicle } from '../utils/vehicleParser';

interface VehicleListDisplayProps {
  vehicles: Vehicle[];
}

export default function VehicleListDisplay({ vehicles }: VehicleListDisplayProps): JSX.Element {
  if (vehicles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No vehicles detected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detected Vehicles:</Text>
      <ScrollView style={styles.scrollView}>
        {vehicles.map((vehicle: Vehicle, index: number) => (
          <View key={index} style={styles.vehicleItem}>
            <Text style={styles.vehicleText}>{vehicle.fullText}</Text>
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
    maxWidth: 400,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  vehicleItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vehicleText: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
