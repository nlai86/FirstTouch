import TeamCard from "@/components/TeamCard";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

const HIGHLIGHTLY_API_KEY = process.env.EXPO_PUBLIC_HIGHLIGHTLY_API_KEY;

export default function Index() {
  const [fixtureData, setFixtureData] = useState(null);
  const [liverpoolTeamId, setLiverpoolTeamId] = useState(null);

  // Check if API key is available
  if (!HIGHLIGHTLY_API_KEY) {
    console.error("HIGHLIGHTLY_API_KEY is not set in .env file");
    return (
      <View style={styles.loading}>
        <Text>API key not configured</Text>
      </View>
    );
  }

  // First, get Liverpool's team ID
  const findLiverpoolTeamId = async () => {
    try {
      const res = await fetch(
        `https://soccer.highlightly.net/teams?name=Liverpool&limit=50`,
        {
          headers: {
            "x-rapidapi-key": HIGHLIGHTLY_API_KEY,
            "Accept": "application/json",
          },
        }
      );
      const json = await res.json();
      console.log("Teams search response:", JSON.stringify(json, null, 2));
      
      if (json.data && json.data.length > 0) {
        // Find Liverpool FC (not Liverpool reserves or other Liverpool teams)
        const liverpool = json.data.find(team => 
          team.name.toLowerCase().includes('liverpool') && 
          !team.name.toLowerCase().includes('reserve') &&
          !team.name.toLowerCase().includes('u23') &&
          !team.name.toLowerCase().includes('u21')
        );
        
        if (liverpool) {
          console.log("Found Liverpool team:", liverpool);
          return liverpool.id;
        }
      }
      return null;
    } catch (err) {
      console.error("Error finding Liverpool team:", err);
      return null;
    }
  };

  // Get detailed match information including venue
  const fetchMatchDetails = async (matchId) => {
    try {
      console.log("Fetching detailed match info for ID:", matchId);
      const res = await fetch(
        `https://soccer.highlightly.net/matches/${matchId}`,
        {
          headers: {
            "x-rapidapi-key": HIGHLIGHTLY_API_KEY,
            "Accept": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch match details:", res.status);
        return null;
      }

      const matchDetails = await res.json();
      console.log("Match details response:", JSON.stringify(matchDetails, null, 2));
      return matchDetails;
    } catch (err) {
      console.error("Error fetching match details:", err);
      return null;
    }
  };

  // Get upcoming matches for Liverpool
  const fetchNextFixture = async (teamId) => {
    try {
      const today = new Date();
      console.log("Current date:", today.toISOString());
      console.log("Fetching matches for team ID:", teamId);
      
      // Fetch both home and away matches
      const [homeRes, awayRes] = await Promise.all([
        fetch(`https://soccer.highlightly.net/matches?homeTeamId=${teamId}&limit=50`, {
          headers: {
            "x-rapidapi-key": HIGHLIGHTLY_API_KEY,
            "Accept": "application/json",
          },
        }),
        fetch(`https://soccer.highlightly.net/matches?awayTeamId=${teamId}&limit=50`, {
          headers: {
            "x-rapidapi-key": HIGHLIGHTLY_API_KEY,
            "Accept": "application/json",
          },
        })
      ]);
      
      const homeJson = homeRes.ok ? await homeRes.json() : { data: [] };
      const awayJson = awayRes.ok ? await awayRes.json() : { data: [] };
      
      console.log("Home matches count:", homeJson.data?.length || 0);
      console.log("Away matches count:", awayJson.data?.length || 0);
      
      // Combine all matches
      const allMatches = [
        ...(homeJson.data || []),
        ...(awayJson.data || [])
      ];
      
      console.log("Total matches found:", allMatches.length);
      
      // Filter for upcoming matches only
      const upcomingMatches = allMatches.filter(match => {
        const matchDate = new Date(match.date);
        const isUpcoming = matchDate > today;
        const isNotStarted = match.state.description === "Not started" || 
                           match.state.description === "To be announced";
        
        console.log(`Match: ${match.homeTeam.name} vs ${match.awayTeam.name}, Date: ${match.date}, State: ${match.state.description}, Is upcoming: ${isUpcoming}, Is not started: ${isNotStarted}`);
        
        return isUpcoming && isNotStarted;
      });
      
      console.log("Upcoming matches found:", upcomingMatches.length);
      
      if (upcomingMatches.length === 0) {
        setFixtureData({
          name: "Liverpool FC",
          logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
          nextOpponent: "No upcoming match found",
          opponentLogo: undefined,
          isHome: true,
          venue: "",
          date: "-",
        });
        return;
      }
      
      // Sort by date (earliest first)
      upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const nextMatch = upcomingMatches[0];
      console.log("Next match selected:", nextMatch);
      
      // Determine if Liverpool is home or away
      const isHome = nextMatch.homeTeam.name.toLowerCase().includes('liverpool');
      const opponent = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
      const liverpoolTeam = isHome ? nextMatch.homeTeam : nextMatch.awayTeam;
      
      console.log("Match details:", {
        matchId: nextMatch.id,
        homeTeam: nextMatch.homeTeam.name,
        awayTeam: nextMatch.awayTeam.name,
        liverpoolIsHome: isHome,
        opponent: opponent.name
      });
      
      // Fetch detailed match information to get venue
      const matchDetails = await fetchMatchDetails(nextMatch.id);
      let venueName = "Venue TBA";
      
      if (matchDetails && matchDetails.length > 0) {
        const detailedMatch = matchDetails[0];
        venueName = detailedMatch.venue?.name || detailedMatch.venue?.city || "Venue TBA";
        console.log("Extracted venue:", venueName);
      }
      
      // Format date and time in EST
      const matchDate = new Date(nextMatch.date);
      const estOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short'
      };
      
      setFixtureData({
        name: "Liverpool FC",
        logo: liverpoolTeam.logo || "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
        nextOpponent: opponent.name,
        opponentLogo: opponent.logo,
        isHome: isHome,
        venue: venueName,
        date: matchDate.toLocaleDateString('en-US', estOptions),
      });
      
    } catch (err) {
      console.error("Error fetching fixture:", err);
      console.error("Error details:", err.message);
      setFixtureData({
        name: "Liverpool FC",
        logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
        nextOpponent: "Error fetching match",
        opponentLogo: undefined,
        isHome: true,
        venue: "",
        date: "-",
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      console.log("Starting to fetch Liverpool data...");
      const teamId = await findLiverpoolTeamId();
      if (teamId) {
        setLiverpoolTeamId(teamId);
        await fetchNextFixture(teamId);
      } else {
        console.error("Could not find Liverpool team ID");
        setFixtureData({
          name: "Liverpool FC",
          logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
          nextOpponent: "Team not found in API",
          opponentLogo: undefined,
          isHome: true,
          venue: "",
          date: "-",
        });
      }
    };
    
    initializeData();
  }, []);

  if (!fixtureData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Loading next Liverpool match...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { alignSelf: 'flex-start', marginLeft: 20 }]}>
        FirstTouch
      </Text>
      <TeamCard
        name={fixtureData.name}
        logo={fixtureData.logo}
        nextOpponent={fixtureData.nextOpponent}
        opponentLogo={fixtureData.opponentLogo}
        isHome={fixtureData.isHome}
        venue={fixtureData.venue}
        date={fixtureData.date}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});