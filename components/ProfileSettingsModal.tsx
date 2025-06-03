import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { View, Pressable, Image } from 'react-native';
import { router } from 'expo-router';

import { Button } from './nativewindui/Button';
import { Text } from './nativewindui/Text';

import { useJournalStore } from '~/store/journal-store';

cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: { height: true, width: true, size: true },
  },
});
interface ProfileSettingsSheetProps {}

export interface ProfileSettingsSheetRef {
  present: () => void;
  dismiss: () => void;
}

const ProfileSettingsSheet = forwardRef<ProfileSettingsSheetRef, ProfileSettingsSheetProps>(
  (props, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
    }));

    const { session, signOut } = useJournalStore();

    const handleLogout = async () => {
      try {
        await signOut();
        bottomSheetModalRef.current?.dismiss();
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const handleShopPress = () => {
      bottomSheetModalRef.current?.dismiss();
      router.push('/shop');
    };

    const getUserDisplayName = () => {
      if (session?.user?.user_metadata?.full_name) {
        return session.user.user_metadata.full_name;
      }
      if (session?.user?.email) {
        return session.user.email;
      }
      return 'User';
    };

    const getUserEmail = () => {
      return session?.user?.email || '';
    };

    const getProfileImageUrl = () => {
      return session?.user?.user_metadata?.avatar_url;
    };
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
          style={[props.style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['80%']}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#a8a29e' }}>
        <BottomSheetView className="flex-1 bg-white p-6 dark:bg-stone-800">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-stone-900 dark:text-white">
              Profile Settings
            </Text>
            <Pressable
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              className="rounded-full p-1 active:bg-stone-100 dark:active:bg-stone-700">
              <Ionicons name="close" size={24} className="text-stone-600 dark:text-stone-400" />
            </Pressable>
          </View>

          {/* User Info */}
          <View className="mb-6 items-center">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
              {getProfileImageUrl() ? (
                <Image
                  source={{ uri: getProfileImageUrl() }}
                  className="h-16 w-16 rounded-full"
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <Ionicons name="person" size={32} className="text-stone-600 dark:text-stone-400" />
              )}
            </View>
            <Text className="text-lg font-medium text-stone-900 dark:text-white">
              {getUserDisplayName()}
            </Text>
            {getUserEmail() && (
              <Text className="text-sm text-stone-600 dark:text-stone-400">{getUserEmail()}</Text>
            )}
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              Account
            </Text>

            <View className="rounded-lg border border-stone-200 dark:border-stone-700">
              <Pressable className="flex-row items-center p-4 active:bg-stone-50 dark:active:bg-stone-700/50">
                <Ionicons
                  name="person-outline"
                  size={20}
                  className="mr-3 text-stone-600 dark:text-stone-400"
                />
                <Text className="flex-1 text-stone-900 dark:text-white">Edit Profile</Text>
                <Ionicons name="chevron-forward" size={16} className="text-stone-400" />
              </Pressable>

              <View className="h-px bg-stone-200 dark:bg-stone-700" />

              <Pressable className="flex-row items-center p-4 active:bg-stone-50 dark:active:bg-stone-700/50">
                <Ionicons
                  name="shield-outline"
                  size={20}
                  className="mr-3 text-stone-600 dark:text-stone-400"
                />
                <Text className="flex-1 text-stone-900 dark:text-white">Privacy & Security</Text>
                <Ionicons name="chevron-forward" size={16} className="text-stone-400" />
              </Pressable>
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
              Sponsor
            </Text>

            <View className="rounded-lg border border-stone-200 dark:border-stone-700">
              <Pressable
                onPress={handleShopPress}
                className="flex-row items-center p-4 active:bg-stone-50 dark:active:bg-stone-700/50">
                <Ionicons
                  name="cafe-outline"
                  size={20}
                  className="mr-3 text-stone-600 dark:text-stone-400"
                />
                <Text className="flex-1 text-stone-900 dark:text-white">Sponsor</Text>
                <Ionicons name="chevron-forward" size={16} className="text-stone-400" />
              </Pressable>
            </View>
          </View>

          <Button
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 border-red-400 bg-red-500/20">
            <Ionicons name="log-out-outline" className="text-red-500" size={20} />
            <Text className="text-red-600">Sign Out</Text>
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ProfileSettingsSheet.displayName = 'ProfileSettingsSheet';

export default ProfileSettingsSheet;
