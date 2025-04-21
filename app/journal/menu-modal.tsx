import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { Text } from '~/components/nativewindui/Text';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onShare: () => void;
  hasMood?: boolean;
}

export const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, onDelete, onShare }) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableWithoutFeedback onPress={onClose}>
      <View className="flex-1">
        <View className="absolute right-4 top-[102px] z-50 w-48 rounded-lg bg-white shadow-xl dark:bg-stone-800">
          <TouchableOpacity onPress={onShare} className="flex-row items-center py-3 pl-4 pr-6">
            <View className="mr-3">
              <Ionicons name="share-outline" size={18} color="#555" />
            </View>
            <Text className="text-sm font-medium text-stone-800 dark:text-stone-200">
              Share note
            </Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-200 dark:bg-stone-700" />

          <TouchableOpacity onPress={onDelete} className="flex-row items-center py-3 pl-4 pr-6">
            <View className="mr-3">
              <Ionicons name="trash-outline" size={18} color="#FF5252" />
            </View>
            <Text className="text-sm font-medium text-stone-800 dark:text-stone-200">
              Delete note
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);
