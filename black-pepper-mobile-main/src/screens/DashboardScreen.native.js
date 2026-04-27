import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

// Dummy Geospatial Data around Jaffna, Sri Lanka
const MOCK_PINS = [
    {
        id: 1,
        coordinate: { latitude: 9.6615, longitude: 80.0255 }, // Central Jaffna area
        title: "Field A1 - Deficient",
        description: "Low Nitrogen & Phosphorus. Needs immediate fertilizer.",
        status: "needs_attention",
    },
    {
        id: 2,
        coordinate: { latitude: 9.6800, longitude: 80.0400 }, // North Jaffna
        title: "Field B3 - Healthy",
        description: "Nutrient levels optimal.",
        status: "healthy",
    },
    {
        id: 3,
        coordinate: { latitude: 9.6450, longitude: 80.0100 }, // South Jaffna
        title: "Field C2 - Deficient",
        description: "Low Potassium. Soil pH irregular.",
        status: "needs_attention",
    },
    {
        id: 4,
        coordinate: { latitude: 9.6700, longitude: 79.9900 }, // West Jaffna
        title: "Field D4 - Healthy",
        description: "Fertilizer applied. Monitoring stable.",
        status: "healthy",
    },
];

export default function DashboardScreen() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header Section */}
            <LinearGradient
                colors={['#1a3409', '#2d5016', '#1a3409']}
                style={styles.headerSection}
            >
                <Text style={styles.headerTitle}>Regional AI Dashboard</Text>
                <Text style={styles.headerSubtitle}>Jaffna District Overview</Text>

                {/* Dummy Statistics */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>124</Text>
                        <Text style={styles.statLabel}>Fields Monitored</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>1,840</Text>
                        <Text style={styles.statLabel}>Predictions Processed</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Map Section */}
            <View style={styles.mapSection}>
                <Text style={styles.sectionTitle}>Live Geospatial Map</Text>
                <Text style={styles.sectionSubtitle}>Monitoring soil health across local farms.</Text>

                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 9.6615,   // Center of Jaffna
                            longitude: 80.0255, // Center of Jaffna
                            latitudeDelta: 0.1, // Zoom level
                            longitudeDelta: 0.1,
                        }}
                    >
                        {MOCK_PINS.map((pin) => (
                            <Marker
                                key={pin.id}
                                coordinate={pin.coordinate}
                                title={pin.title}
                                description={pin.description}
                                pinColor={pin.status === 'healthy' ? 'green' : 'red'}
                            />
                        ))}
                    </MapView>
                </View>
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'red' }]} />
                        <Text style={styles.legendText}>Deficient (Needs Fertilizer)</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: 'green' }]} />
                        <Text style={styles.legendText}>Healthy Soil</Text>
                    </View>
                </View>
            </View>

            {/* Recommended Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Regional Recommendations</Text>

                <View style={styles.actionCard}>
                    <Text style={styles.actionEmoji}>🔴</Text>
                    <View style={styles.actionTextContent}>
                        <Text style={styles.actionTitle}>High Priority: Nitrogen Boost</Text>
                        <Text style={styles.actionDescription}>
                            45% of monitored fields in South Jaffna showed severe Nitrogen depletion this week. Urea application recommended.
                        </Text>
                    </View>
                </View>

                <View style={styles.actionCard}>
                    <Text style={styles.actionEmoji}>🟠</Text>
                    <View style={styles.actionTextContent}>
                        <Text style={styles.actionTitle}>Monitoring: Potassium Levels</Text>
                        <Text style={styles.actionDescription}>
                            Slight Potassium dip detected near West Jaffna borders. Suggesting MOP (Muriate of Potash) preparation.
                        </Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerSection: {
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#aed581',
        textAlign: 'center',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '45%',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#eee',
        textAlign: 'center',
        fontWeight: '600',
    },
    mapSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2d5016',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
    },
    mapContainer: {
        height: 300,
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 15,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#444',
        fontWeight: '600',
    },
    actionsSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    actionCard: {
        flexDirection: 'row',
        backgroundColor: '#f9fbe7',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#8bc34a',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionEmoji: {
        fontSize: 24,
        marginRight: 15,
        alignSelf: 'center',
    },
    actionTextContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 5,
    },
    actionDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});
