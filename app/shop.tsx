import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View, Pressable, Image, Linking } from 'react-native';

import { Container } from '~/components/Container';
import { Text } from '~/components/nativewindui/Text';

const splitKeyboards = [
  {
    id: 1,
    name: 'Ergodox EZ',
    price: '$365',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    description: 'The ultimate ergonomic split keyboard with Cherry MX switches',
    url: 'https://ergodox-ez.com/',
  },
  {
    id: 2,
    name: 'Kinesis Freestyle Pro',
    price: '$179',
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    description: 'Professional split keyboard with mechanical switches',
    url: 'https://kinesis-ergo.com/shop/freestyle-pro/',
  },
  {
    id: 3,
    name: 'ZSA Moonlander',
    price: '$365',
    image: 'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400',
    description: 'Next-gen ergonomic keyboard with RGB lighting',
    url: 'https://www.zsa.io/moonlander/',
  },
  {
    id: 4,
    name: 'Keychron Q8',
    price: '$195',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400',
    description: 'Alice layout split keyboard with gasket mount',
    url: 'https://www.keychron.com/products/keychron-q8-alice-layout-qmk-via-wireless-custom-mechanical-keyboard',
  },
];

export default function ShopScreen() {
  const handleProductPress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <Container>
      <View className="flex-1 bg-white dark:bg-stone-900">
        <ScrollView className="flex-1 px-4">
          {/* Header Section */}
          <View className="mb-6 items-center py-6">
            <Text className="mb-2 text-2xl font-bold text-stone-900 dark:text-white">
              Split Keyboards
            </Text>
            <Text className="text-center text-stone-600 dark:text-stone-400">
              Ergonomic split keyboards for better typing comfort
            </Text>
          </View>

          {/* Products Grid */}
          <View className="gap-4">
            {splitKeyboards.map((keyboard) => (
              <Pressable
                key={keyboard.id}
                onPress={() => handleProductPress(keyboard.url)}
                className="rounded-lg border border-stone-200 bg-white p-4 active:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:active:bg-stone-700">
                <View className="flex-row">
                  <Image
                    source={{ uri: keyboard.image }}
                    className="h-20 w-20 rounded-lg"
                    style={{ width: 80, height: 80 }}
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-stone-900 dark:text-white">
                      {keyboard.name}
                    </Text>
                    <Text className="mb-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                      {keyboard.price}
                    </Text>
                    <Text className="text-sm text-stone-600 dark:text-stone-400">
                      {keyboard.description}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} className="text-stone-400" />
                </View>
              </Pressable>
            ))}
          </View>

          {/* Footer */}
          <View className="my-8 items-center">
            <Text className="text-wrap text-center text-sm text-stone-500 dark:text-stone-500">
              Supporting our sponsors helps keep Echo Journal free 💙
            </Text>
          </View>
        </ScrollView>
      </View>
    </Container>
  );
}

