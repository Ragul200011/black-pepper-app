import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const isSmallScreen = width < 480;
const isWideScreen = width >= 768;

export default function DiseaseHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem("disease_history");
      const parsed = stored ? JSON.parse(stored) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.log("History load error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all saved results?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("disease_history");
            setHistory([]);
          },
        },
      ]
    );
  };

  const getShortDescription = (text) => {
    if (!text) return "No description available.";
    return text.length > 95 ? `${text.slice(0, 95)}...` : text;
  };

  const isDisplayableImage = (uri) => {
    if (!uri || typeof uri !== "string") return false;

    if (uri.startsWith("blob:")) return false;

    return (
      uri.startsWith("http://") ||
      uri.startsWith("https://") ||
      uri.startsWith("file://") ||
      uri.startsWith("data:image/") ||
      uri.startsWith("/")
    );
  };

  const handleOpenItem = (item) => {
    navigation.navigate("DiseaseResult", {
      image: item.image,
      disease: item.disease,
      confidence: item.confidence,
      treatment: item.treatment,
      description: item.description,
      probabilities: item.probabilities,
      lowConfidence: item.lowConfidence,
    });
  };

  const handleNewDetection = () => {
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
        <Text style={styles.headerBadge}>Saved Results</Text>
        <Text style={styles.title}>Detection History</Text>
        <Text style={styles.subtitle}>
          Review your previous black pepper leaf disease detections in one place.
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyTitle}>No Saved Results Yet</Text>
            <Text style={styles.emptyText}>
              Your saved disease detection records will appear here after you save a result.
            </Text>

            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={handleNewDetection}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyActionButtonText}>Start New Detection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.topActionRow}>
              <TouchableOpacity
                style={styles.newDetectionButton}
                onPress={handleNewDetection}
                activeOpacity={0.85}
              >
                <Text style={styles.newDetectionButtonText}>➕ New Detection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearHistory}
                activeOpacity={0.85}
              >
                <Text style={styles.clearButtonText}>🗑 Clear History</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultCount}>
              {history.length} saved {history.length === 1 ? "result" : "results"}
            </Text>

            {history.map((item, index) => {
              const canShowImage = isDisplayableImage(item.image);
              const cardKey = item.id ?? `${item.savedAt ?? "item"}-${index}`;

              return (
                <View
                  key={cardKey}
                  style={styles.cardWrapper}
                  onMouseEnter={() =>
                    Platform.OS === "web" && setHoveredId(item.id)
                  }
                  onMouseLeave={() =>
                    Platform.OS === "web" && setHoveredId(null)
                  }
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.card}
                    onPress={() => handleOpenItem(item)}
                  >
                    {canShowImage ? (
                      <Image source={{ uri: item.image }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
                        <Text style={styles.imagePlaceholderText}>
                          Preview unavailable
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardContent}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.disease}>
                          {item.disease || "Unknown disease"}
                        </Text>

                        {item.lowConfidence ? (
                          <View style={styles.lowConfidenceBadge}>
                            <Text style={styles.lowConfidenceBadgeText}>
                              Low confidence
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.metaText}>
                        Confidence: {item.confidence || "N/A"}
                      </Text>
                      <Text style={styles.metaText}>
                        Saved: {item.savedAt || "Unknown date"}
                      </Text>

                      <Text style={styles.shortDesc}>
                        {getShortDescription(item.description)}
                      </Text>

                      {!canShowImage && Platform.OS === "web" && (
                        <Text style={styles.previewWarning}>
                          Image preview is unavailable for temporary web uploads.
                        </Text>
                      )}

                      <View style={styles.cardFooter}>
                        <View style={styles.openButton}>
                          <Text style={styles.openButtonText}>View Details</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {Platform.OS === "web" && hoveredId === item.id && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipTitle}>Full Details</Text>

                      <Text style={styles.tooltipText}>
                        <Text style={styles.tooltipLabel}>Description: </Text>
                        {item.description || "No description"}
                      </Text>

                      <Text style={styles.tooltipText}>
                        <Text style={styles.tooltipLabel}>Treatment: </Text>
                        {item.treatment || "No treatment advice"}
                      </Text>

                      {item.lowConfidence && (
                        <Text style={styles.tooltipWarning}>
                          ⚠ This was saved as a low-confidence or possible early
                          infection result.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
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

  headerBadge: {
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

  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: isSmallScreen ? 13 : 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 760,
  },

  content: {
    padding: isSmallScreen ? 14 : 20,
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dceccf",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 18,
    maxWidth: 420,
  },

  emptyActionButton: {
    backgroundColor: "#2d5016",
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
  },

  emptyActionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  topActionRow: {
    flexDirection: isWideScreen ? "row" : "column",
    gap: 12,
    marginBottom: 14,
  },

  newDetectionButton: {
    flex: 1,
    backgroundColor: "#2d5016",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  newDetectionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  clearButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  resultCount: {
    fontSize: 13,
    color: "#667085",
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  cardWrapper: {
    position: "relative",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: isSmallScreen ? 12 : 14,
    borderWidth: 1,
    borderColor: "#dceccf",
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  image: {
    width: isSmallScreen ? 96 : 110,
    height: isSmallScreen ? 96 : 110,
    borderRadius: 14,
  },

  imagePlaceholder: {
    width: isSmallScreen ? 96 : 110,
    height: isSmallScreen ? 96 : 110,
    borderRadius: 14,
    backgroundColor: "#eef3ea",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  imagePlaceholderIcon: {
    fontSize: 26,
    marginBottom: 6,
  },

  imagePlaceholderText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },

  cardContent: {
    flex: 1,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },

  disease: {
    flex: 1,
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: "700",
    color: "#2d5016",
  },

  lowConfidenceBadge: {
    backgroundColor: "#fff4d6",
    borderWidth: 1,
    borderColor: "#f3d27a",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  lowConfidenceBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9a6700",
  },

  metaText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },

  shortDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    lineHeight: 20,
  },

  previewWarning: {
    marginTop: 8,
    fontSize: 12,
    color: "#8a6d3b",
    lineHeight: 16,
  },

  cardFooter: {
    marginTop: 12,
    alignItems: "flex-start",
  },

  openButton: {
    backgroundColor: "#eef8e8",
    borderWidth: 1,
    borderColor: "#d8ebcb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  openButtonText: {
    color: "#2d5016",
    fontSize: 13,
    fontWeight: "700",
  },

  tooltip: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 300,
    backgroundColor: "#1f2a1f",
    borderRadius: 12,
    padding: 14,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  tooltipTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },

  tooltipText: {
    color: "#f1f1f1",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },

  tooltipLabel: {
    fontWeight: "700",
    color: "#fff",
  },

  tooltipWarning: {
    color: "#ffd27f",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});