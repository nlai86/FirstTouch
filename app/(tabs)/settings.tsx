// app/(tabs)/settings.tsx
import { Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Settings</Text>
      <Text>App and Account Settings</Text>
    </View>
  );
}
