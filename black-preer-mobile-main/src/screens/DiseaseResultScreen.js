import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const isSmallScreen = width < 480;
const isWideScreen = width >= 768;

export default function DiseaseResultScreen({ route, navigation }) {
  const {
    image,
    disease,
    confidence,
    treatment,
    description,
    probabilities,
    lowConfidence,
  } = route.params;

  const getSafeImageForHistory = (uri) => {
    if (!uri || typeof uri !== "string") return null;
    if (Platform.OS === "web" && uri.startsWith("blob:")) return null;
    return uri;
  };

  const handleSave = async () => {
    try {
      const safeImage = getSafeImageForHistory(image);

      const newItem = {
        id: Date.now().toString(),
        image: safeImage,
        disease,
        confidence,
        treatment,
        description,
        probabilities,
        lowConfidence: lowConfidence || false,
        savedAt: new Date().toLocaleString(),
      };

      const existing = await AsyncStorage.getItem("disease_history");
      const history = existing ? JSON.parse(existing) : [];

      history.unshift(newItem);

      await AsyncStorage.setItem("disease_history", JSON.stringify(history));

      if (Platform.OS === "web" && image?.startsWith("blob:")) {
        Alert.alert(
          "Saved",
          "The result was saved. Image preview may not be available later on web for temporary uploaded images."
        );
      }

      navigation.navigate("DiseaseHistory");
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleHistory = () => {
    navigation.navigate("DiseaseHistory");
  };

  const handleDetectAnother = () => {
    navigation.navigate("DiseaseUpload");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#1a3409", "#2d5016", "#1a3409"]}
        style={styles.header}
      >
        <Text style={styles.badge}>AI Analysis Complete</Text>
        <Text style={styles.title}>Detection Result</Text>
        <Text style={styles.headerSubtitle}>
          Review the prediction, confidence level, and treatment guidance below.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.imageCard}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
              <Text style={styles.imagePlaceholderText}>No image preview</Text>
            </View>
          )}
        </View>

        {lowConfidence && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠ Low Confidence Detection</Text>
            <Text style={styles.warningText}>
              This result may indicate an early or mild infection. Capture a clearer
              close-up image in good lighting for more accurate detection and monitor
              the plant condition.
            </Text>
          </View>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.cardHeading}>Detected Disease</Text>
          <Text style={styles.resultValue}>{disease || "Unknown"}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Confidence</Text>
            <Text style={styles.valueHighlight}>{confidence || "N/A"}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.labelBlock}>Description</Text>
          <Text style={styles.valueBlock}>
            {description || "No description available."}
          </Text>

          <Text style={styles.labelBlock}>Treatment Recommendation</Text>
          <Text style={styles.valueBlock}>
            {treatment || "Consult an agricultural expert."}
          </Text>
        </View>

        {probabilities && Object.keys(probabilities).length > 0 && (
          <View style={styles.probCard}>
            <Text style={styles.cardHeading}>All Predictions</Text>

            {Object.entries(probabilities).map(([key, value]) => (
              <View key={key} style={styles.probRow}>
                <Text style={styles.probDisease}>{key}</Text>
                <Text style={styles.probValue}>{value}%</Text>
              </View>
            ))}
          </View>
        )}

        <View
          style={[
            styles.buttonGroup,
            isWideScreen && styles.buttonGroupWide,
          ]}
        >
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>💾 Save Result</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyButton} onPress={handleHistory}>
            <Text style={styles.historyButtonText}>📜 View History</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.detectAgainButton}
          onPress={handleDetectAnother}
        >
          <Text style={styles.detectAgainText}>🔄 Detect Another Leaf</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7faf7",
  },

  scrollContent: {
    paddingBottom: 28,
  },

  header: {
    paddingTop: isSmallScreen ? 42 : 60,
    paddingBottom: isSmallScreen ? 24 : 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    overflow: "hidden",
  },

  title: {
    color: "#fff",
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: isSmallScreen ? 13 : 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 760,
  },

  content: {
    padding: isSmallScreen ? 14 : 20,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
  },

  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#dceccf",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  image: {
    width: "100%",
    height: isSmallScreen ? 220 : isWideScreen ? 380 : 280,
    resizeMode: "cover",
  },

  imagePlaceholder: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef3ea",
  },

  imagePlaceholderIcon: {
    fontSize: 34,
    marginBottom: 8,
  },

  imagePlaceholderText: {
    fontSize: 14,
    color: "#666",
  },

  warningCard: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffe08a",
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 6,
  },

  warningText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },

  resultCard: {
    backgroundColor: "#f1f8e9",
    padding: isSmallScreen ? 16 : 20,
    borderRadius: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#dceccf",
  },

  cardHeading: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 10,
  },

  resultValue: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: "800",
    color: "#4caf50",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d5016",
  },

  valueHighlight: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f3d0f",
  },

  divider: {
    height: 1,
    backgroundColor: "#d7e6cf",
    marginVertical: 14,
  },

  labelBlock: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d5016",
    marginTop: 8,
    marginBottom: 6,
  },

  valueBlock: {
    fontSize: 14,
    color: "#444",
    lineHeight: 21,
  },

  probCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#dceccf",
  },

  probRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3ea",
  },

  probDisease: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    paddingRight: 10,
  },

  probValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d5016",
  },

  buttonGroup: {
    gap: 12,
    flexDirection: "column",
    marginBottom: 14,
  },

  buttonGroupWide: {
    flexDirection: "row",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#2d5016",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  historyButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#b9d3b0",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  historyButtonText: {
    color: "#2d5016",
    fontWeight: "700",
    fontSize: 16,
  },

  detectAgainButton: {
    backgroundColor: "#eef5eb",
    borderWidth: 1,
    borderColor: "#dceccf",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  detectAgainText: {
    color: "#2d5016",
    fontWeight: "700",
    fontSize: 15,
  },
});