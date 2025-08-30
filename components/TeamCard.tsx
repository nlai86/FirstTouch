// components/TeamCard.tsx
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

type TeamCardProps = {
  name: string;
  logo?: string;
  nextOpponent: string;
  opponentLogo?: string;
  isHome: boolean;
  venue?: string;
  date: string;
};

const screenWidth = Dimensions.get("window").width;

export default function TeamCard({
  name,
  logo,
  nextOpponent,
  opponentLogo,
  isHome,
  venue,
  date,
}: TeamCardProps) {
  return (
    <View style={styles.card}>
      {/* Top row: team vs opponent */}
      <View style={styles.row}>
        {/* Left side: your team (Liverpool) */}
        <View style={styles.team}>
          {logo && <Image source={{ uri: logo }} style={styles.logo} />}
          <Text style={styles.name}>
            {name} {isHome ? "(H)" : "(A)"}
          </Text>
        </View>
        
        <Text style={styles.vsText}>vs</Text>
        
        {/* Right side: opponent */}
        <View style={styles.team}>
          {opponentLogo && <Image source={{ uri: opponentLogo }} style={styles.logo} />}
          <Text style={styles.name}>
            {nextOpponent} {isHome ? "(A)" : "(H)"}
          </Text>
        </View>
      </View>
      
      {/* Venue row */}
      {venue && (
        <Text style={styles.venue}>Venue: {venue}</Text>
      )}
      
      {/* Bottom row: date */}
      <Text style={styles.text}>Date: {date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.8, // 80% of screen
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: 16,
    margin: 12,
    alignSelf: "center", // center in parent
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  team: {
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 4,
    resizeMode: "contain",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  vsText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  venue: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});