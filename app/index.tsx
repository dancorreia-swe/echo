import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

import Quote from '~/components/Quote';
import { Text } from '~/components/nativewindui/Text';

export default function Screen() {
  return (
    <View className="flex-1 bg-white p-4 px-8 pt-6 dark:bg-stone-900">
      <Greeting />
      <Quote />
      <ExpandableButton />
    </View>
  );
}

function ExpandableButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'journal' | 'mic'>('journal');
  const animation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  // Animation for expanding/collapsing
  const toggleExpand = useCallback(() => {
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: false, // Set to false to allow layout animations
    }).start();

    setIsExpanded(!isExpanded);
  }, [isExpanded, animation]);

  // Calculate positions for the dropdown options
  const featherTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const micTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  // Background opacity and height animation
  const backgroundHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 220], // Actual height values instead of scale
  });

  const backgroundOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  });

  // Handle option selection
  const handleOptionSelect = (option: 'journal' | 'mic') => {
    setSelectedOption(option);
    setIsExpanded(false);

    // Animate back to collapsed state
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: false, // Match the other animation
    }).start();

    // Here you would handle navigation based on the selected option
    // For now, we're just updating the icon as requested
    console.log(`Selected option: ${option}`);
  };

  // Handle main button press (normal press)
  const handleMainButtonPress = () => {
    if (isExpanded) {
      toggleExpand();
    } else {
      // Navigate to audio entry page
      router.push('/audio-entry');
    }
  };

  // Function to collapse the menu
  const collapseMenu = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      Animated.spring(animation, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: false,
      }).start();
    }
  }, [isExpanded, animation]);

  return (
    <View className="absolute bottom-8 right-8">
      {/* Overlay to detect outside clicks */}
      {isExpanded && (
        <TouchableOpacity
          activeOpacity={0}
          onPress={collapseMenu}
          style={{
            position: 'absolute',
            top: -1000,
            left: -1000,
            right: -1000,
            bottom: -1000,
            zIndex: 0,
          }}
        />
      )}

      {/* Expandable options */}
      <View className="absolute bottom-0 right-0">
        {/* Background pill that extends */}
        <Animated.View
          className="bg-stone-500/90 dark:bg-stone-600/90"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 64,
            height: backgroundHeight,
            opacity: backgroundOpacity,
            borderRadius: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 1,
          }}
        />

        {/* Journal option */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 4, // Fixed position from bottom
            right: 0,
            opacity: animation,
            transform: [{ translateY: featherTranslateY }],
            zIndex: 2,
          }}>
          <TouchableOpacity
            onPress={() => handleOptionSelect('journal')}
            className="flex h-16 w-16 items-center justify-center">
            <Ionicons name="journal-outline" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {/* Mic option */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: -4, // Fixed position from bottom
            right: 0,
            opacity: animation,
            transform: [{ translateY: micTranslateY }],
            zIndex: 2,
          }}>
          <TouchableOpacity
            onPress={() => handleOptionSelect('mic')}
            className="flex h-16 w-16 items-center justify-center">
            <Ionicons name="mic-outline" size={28} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Main button */}
      <TouchableOpacity
        onPress={handleMainButtonPress}
        onLongPress={toggleExpand}
        delayLongPress={300}
        className="flex size-16 items-center justify-center rounded-full bg-stone-500 shadow-md dark:bg-stone-600"
        activeOpacity={0.8}
        style={{ zIndex: 3 }}>
        {isExpanded ? (
          <MaterialIcons name="close" size={28} color="white" />
        ) : (
          <Ionicons
            name={selectedOption === 'journal' ? 'journal-outline' : 'mic-outline'}
            size={28}
            color="white"
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

function Greeting() {
  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return 'Good morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good afternoon';
    } else if (currentHour >= 18 && currentHour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  }, []);

  return (
    <>
      <Text className="font-md text-2xl text-stone-800 dark:text-stone-100">{greeting},</Text>
      <Text className="mt-1 text-4xl font-bold text-stone-900 dark:text-white">Daniel</Text>
    </>
  );
}
