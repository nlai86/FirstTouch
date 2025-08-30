import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const router = useRouter();

  {/*List of Teams; replace later with API */}
  const teams = [
    { id: "liverpool_fc", name: "Liverpool FC"},
    { id: "toronto_raptors", name: "Toronto Raptors"},
    { id: "toronto_maple_leafs", name: "Toronto Maple Leafs"},
    { id: "toronto_blue_jays", name: "Toronto Blue Jays"},
  ]

  return (
    <View>
      <Text style={styles.title}>FirstTouch</Text>
    </View>
  );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: 'white', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: 'black',
    textAlign: 'center',
    marginTop: 80,
  },
  teamName: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    paddingTop: 30,
  }

});