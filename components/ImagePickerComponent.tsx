import { StyleSheet, Text, View, Button, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { extractTextFromImage, OCRResult } from '../utils/ocrService';
import { parseVehicles, Vehicle } from '../utils/vehicleParser';
import { preprocessImageForOCR } from '../utils/imagePreprocessor';
import EditableVehicleList from './EditableVehicleList';
import RawTextDebug from './RawTextDebug';

export default function ImagePickerComponent(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const pickImage = async (): Promise<void> => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    // Launch image picker
    const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      quality: 1,
    });

    // Check if user cancelled the picker
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri: string = result.assets[0].uri;
      setSelectedImage(imageUri);

      // Process the image with OCR
      await processImage(imageUri);
    }
  };

  const processImage = async (imageUri: string): Promise<void> => {
    setIsProcessing(true);
    setVehicles([]); // Clear previous results
    setOcrResult(null); // Clear previous OCR result

    try {
      // Preprocess image to enhance contrast and improve OCR accuracy
      const processedImageUri: string = await preprocessImageForOCR(imageUri);

      // Extract text from processed image using OCR
      const result: OCRResult = await extractTextFromImage(processedImageUri);

      // Save OCR result for debugging
      setOcrResult(result);

      // Parse vehicles from extracted text
      const detectedVehicles: Vehicle[] = parseVehicles(result.text);

      setVehicles(detectedVehicles);

      if (detectedVehicles.length === 0) {
        Alert.alert('No Vehicles Found', 'Could not detect any vehicles in the image. Please try a clearer image.');
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('OCR Error', `Failed to process image: ${errorMessage}`);
      console.error('OCR processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Text style={styles.title}>EbayScrape</Text>
        <Text style={styles.subtitle}>Car Listing OCR Tool</Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Select Image from Gallery"
            onPress={pickImage}
            disabled={isProcessing}
          />
        </View>

        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {selectedImage && !isProcessing && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Selected Image:</Text>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}

        {ocrResult && !isProcessing && (
          <RawTextDebug rawText={ocrResult.text} confidence={ocrResult.confidence} />
        )}

        {vehicles.length > 0 && !isProcessing && (
          <EditableVehicleList
            vehicles={vehicles}
            onVehiclesChange={setVehicles}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 400,
    resizeMode: 'contain',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
