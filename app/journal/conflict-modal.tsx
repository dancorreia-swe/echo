import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';

interface ConflictModalProps {
  visible: boolean;
  onClose: () => void;
  onOverride: () => void;
  onAppend: () => void;
  onKeepExisting: () => void;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  visible,
  onClose,
  onOverride,
  onAppend,
  onKeepExisting,
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 items-center justify-center bg-black/50">
      <View className="w-[90%] rounded-xl bg-white p-5 shadow-xl dark:bg-stone-800">
        <Text className="mb-4 text-xl font-bold text-stone-800 dark:text-stone-200">
          Content Conflict
        </Text>
        <Text className="mb-6 text-stone-700 dark:text-stone-300">
          There is already saved content for this date. What would you like to do?
        </Text>

        <View className="mb-2 flex-row justify-between">
          <TouchableOpacity
            onPress={onOverride}
            className="mr-2 flex-1 rounded-lg bg-blue-500 px-4 py-3">
            <Text className="text-center font-medium text-white">Override</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onAppend}
            className="ml-2 flex-1 rounded-lg bg-green-500 px-4 py-3">
            <Text className="text-center font-medium text-white">Append</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onKeepExisting}
          className="mt-2 rounded-lg bg-stone-300 px-4 py-3 dark:bg-stone-700">
          <Text className="text-center font-medium text-stone-800 dark:text-stone-200">
            Keep Existing
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
