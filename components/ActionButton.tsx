import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';

export default function ActionButton() {
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

  const featherTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const micTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -160],
  });

  const backgroundHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 220], // Actual height values instead of scale
  });

  const backgroundOpacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  });

  const handleOptionSelect = (option: 'journal' | 'mic') => {
    setSelectedOption(option);
    setIsExpanded(false);

    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: false, // Match the other animation
    }).start();

    console.log(`Selected option: ${option}`);
  };

  // Handle main button press (normal press)
  const handleMainButtonPress = () => {
    if (isExpanded) {
      toggleExpand();
    } else {
      if (selectedOption === 'journal') {
        // Format date as YYYY-MM-DD for consistent reference using local timezone
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        router.push({
          pathname: '/journal/[day]',
          params: {
            day: formattedDate,
            isNew: 'true',
          },
        });
        console.log(`Navigating to new journal entry with day: ${formattedDate}`);
      } else router.push('/audio-entry');
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
          className="bg-stone-500 dark:bg-stone-600"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 64,
            height: backgroundHeight,
            opacity: backgroundOpacity,
            borderRadius: 32,
            zIndex: 1,
          }}
        />

        {/* Journal option */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 4,
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
        className="flex size-16 items-center justify-center rounded-full bg-stone-500 dark:bg-stone-600"
        activeOpacity={0.8}
        style={{
          zIndex: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
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
