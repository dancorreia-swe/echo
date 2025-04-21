import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { View, TouchableOpacity, Alert, Platform, ActionSheetIOS } from 'react-native';

import { Attachment } from '~/store/journal-store';

type Props = {
  onAttachDoc: (file: Attachment) => void;
  onAttachImage: (file: Attachment) => void;
};

export const BottomToolbar: React.FC<Props> = ({ onAttachDoc, onAttachImage }) => {
  const handleImage = async () => {
    const takePhoto = async () => {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos', 'livePhotos'],
        quality: 0.85,
      });
      if (!res.canceled) {
        const asset = res.assets[0];
        onAttachImage({
          uri: asset.uri,
          type: asset.type ?? 'image',
          name: asset.fileName ?? 'photo.jpg',
        });
      }
    };
    const pickFromGallery = async () => {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos', 'livePhotos'],
        quality: 0.85,
      });
      if (!res.canceled) {
        const asset = res.assets[0];
        onAttachImage({
          uri: asset.uri,
          type: asset.type ?? 'image',
          name: asset.fileName ?? 'photo.jpg',
        });
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take Photo', 'Pick from Library', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) takePhoto();
          else if (buttonIndex === 1) pickFromGallery();
        }
      );
    } else {
      Alert.alert('Add Image', undefined, [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Pick from Library', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleAttachDoc = async () => {
    const res: DocumentPicker.DocumentPickerResult = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      copyToCacheDirectory: true,
    });

    if (!res.canceled) {
      onAttachDoc({
        uri: res.assets[0].uri,
        type: res.assets[0].mimeType ?? 'application/octet-stream',
        name: res.assets[0].name,
      });
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0">
      <BlurView
        intensity={20}
        tint="light"
        className="border-t border-gray-200 dark:border-stone-800">
        <View className="flex-row justify-around px-6 py-4">
          <TouchableOpacity
            onPress={handleAttachDoc}
            className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
            <Ionicons name="attach" size={22} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700"
            disabled>
            <Ionicons name="mic-outline" size={22} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleImage}
            className="h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
            <Ionicons name="image-outline" size={22} color="#555" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};
