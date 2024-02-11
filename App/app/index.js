// IMPORTS
import { Stack,useRouter } from 'expo-router';
import { SafeAreaView, View, Text } from 'react-native';

// CONSTANTS
import colors from '../constants/colors';

// HOMESCREEN
const Home = () => {
  // Hooks
  const router = useRouter();

  return (
    <SafeAreaView>
      {/* HEADER */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      {/* TAB MENU */}
      <View className="py-5 justify-center items-center">
        {/* TITLE */}
        <View className="my-7 items-center">
          <Text className="font-medium text-primary" style={{ fontSize: 48 }}>Signless</Text>
          <Text className="text-xl">Say more, sign less</Text>
        </View>
        <View className="flex-row">
          <View className="bg-primary px-4 py-2 rounded-full mr-3">
            <Text className="text-white" onPress={() => router.push('audio-to-sign')}>Audio to Sign</Text>
          </View>
          <View className="bg-secondary px-4 py-2 rounded-full">
            <Text onPress={() => router.push('sign-to-text')}>
              Sign to Text
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;