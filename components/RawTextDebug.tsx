import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

interface RawTextDebugProps {
  rawText: string;
  confidence: number;
}

export default function RawTextDebug({ rawText, confidence }: RawTextDebugProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand} style={styles.headerContainer}>
        <Text style={styles.header}>
          {isExpanded ? '▼' : '▶'} Raw OCR Text (Confidence: {confidence.toFixed(1)}%)
        </Text>
        <Text style={styles.hint}>{isExpanded ? 'Click to collapse' : 'Click to expand'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.rawText}>{rawText}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
  },
  headerContainer: {
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  hint: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 3,
  },
  scrollView: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  rawText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});
