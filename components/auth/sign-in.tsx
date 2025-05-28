import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '../nativewindui/Button';
import { Text } from '../nativewindui/Text';
import { TextInput } from '../nativewindui/TextInput';

import { supabase } from '~/utils/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    if (!session) Alert.alert('Please check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="flex-1 items-center justify-center bg-white p-8 dark:bg-stone-900">
      <View className="w-full max-w-sm">
        <Text className="mb-2 text-center text-3xl font-bold text-stone-900 dark:text-white">
          Welcome to Echo Journal
        </Text>
        <Text className="mb-8 text-stone-600 dark:text-stone-400">
          Sign in to continue your journaling journey
        </Text>

        <View className="mb-4">
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        <View className="mb-6">
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry
            placeholder="Password"
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        <View className="mb-4">
          <Button disabled={loading} onPress={() => signInWithEmail()}>
            <Text>{loading ? 'Signing in...' : 'Sign in'}</Text>
          </Button>
        </View>

        <Button variant="secondary" disabled={loading} onPress={() => signUpWithEmail()}>
          <Text>{loading ? 'Creating account...' : 'Create account'}</Text>
        </Button>
      </View>
    </View>
  );
}
