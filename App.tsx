import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import ImagePickerComponent from './components/ImagePickerComponent';

export default function App(): JSX.Element {
  return (
    <View style={styles.container}>
      <ImagePickerComponent />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
