import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Icon } from '@roninoss/icons';
import { useState, useEffect } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '../nativewindui/Button';
import { Text } from '../nativewindui/Text';
import { TextInput } from '../nativewindui/TextInput';

import { supabase } from '~/utils/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

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

  async function signInWithGoogle() {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data?.idToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          Alert.alert('Authentication Error', error.message);
        }
      } else {
        Alert.alert('Error', 'Failed to get Google ID token');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        Alert.alert('Error', 'Something went wrong with Google Sign-In');
        console.error('Google Sign-In Error:', error);
      }
    } finally {
      setLoading(false);
    }
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

        <View className="mb-4">
          <Button variant="secondary" disabled={loading} onPress={() => signUpWithEmail()}>
            <Text>{loading ? 'Creating account...' : 'Create account'}</Text>
          </Button>
        </View>

        <View className="mb-6 flex-row items-center">
          <View className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
          <Text className="mx-4 text-stone-500 dark:text-stone-400">or</Text>
          <View className="h-px flex-1 bg-stone-300 dark:bg-stone-600" />
        </View>

        <Button
          variant="tonal"
          disabled={loading}
          onPress={() => signInWithGoogle()}
          className="flex-row items-center gap-3">
          <Icon name="logo-google" size={20} />
          <Text>Continue with Google</Text>
        </Button>
      </View>
    </View>
  );
}
