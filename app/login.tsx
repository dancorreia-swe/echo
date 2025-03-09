import { useNavigation } from 'expo-router';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { Text } from '~/components/nativewindui/Text';

const Login = () => {
  const { navigate } = useNavigation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-4xl font-bold text-primary">Login</Text>
      <Pressable className="mt-4 rounded-lg bg-primary p-2" onPress={() => navigate('index')}>
        <Text className="text-lg font-semibold text-background">Go to Index</Text>
      </Pressable>
    </View>
  );
};

export default Login;
