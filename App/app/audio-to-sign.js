// IMPORTS
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Button, Text, SafeAreaView, Image } from 'react-native';
import { Audio } from 'expo-av';

// DATA
import letterImageMap from '../constants/signHashmap.js';

// TEXT TO SIGN COMPONENT
const TextToSign = () => {
  // Hooks
  const [recording, setRecording] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [recordDuration, setRecordDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [textResult, setTextResult] = useState('');
  const [charArray, setCharArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(undefined);

  // Process new recording
  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setRecordDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Start recording
  async function startRecording() {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status === 'granted') {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: 1,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      setTextResult('');
    } else {
      console.log('Permissions not granted to record.');
    }
  }

  // Stop recording
  async function stopRecording() {
    if (!recording) return;
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedAudio(uri);
    setRecordDuration(0);
  }

  // Play recording
  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      { uri: recordedAudio },
      { shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
    await sound.playAsync();
  }

  // Update playback status
  const updatePlaybackStatus = (status) => {
    if (status.isPlaying) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis);
    }
    if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  // Get recording duration
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Submit recording to Server
  async function submitRecording() {
    const uri = recordedAudio; // Assuming recordedAudio is the URI of the recording
    const formData = new FormData();
    // You need to extract the file name and type from the uri if needed. Here it's hardcoded for simplicity.
    formData.append('audioFile', {
      uri,
      name: 'audio.m4a', // This should match your recorded file name and extension
      type: 'audio/mp4', // MIME type for m4a files
    });

    try {
      const response = await fetch('http://localhost:3000/api/audio-to-text', {
        method: 'POST',
        body: formData,
        headers: {
          // When using FormData, React Native automatically sets the 'Content-Type' to 'multipart/form-data'
          // and includes the boundary string, so you don't need to manually set it.
        },
      });
      const result = await response.text();
      const parsedResult = JSON.parse(result).text;
      setTextResult(parsedResult.toLowerCase());

      console.log(parsedResult);
      setCurrentIndex(0);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // Handle image animation
  useEffect(() => {
    if (textResult) {
      const charArray = textResult.split('');
      setCharArray(charArray);
    }
  }, [textResult]);

  // 
  useEffect(() => {
    if(charArray.length > 0) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          // Reset to 0 if we've reached the end, or increment the index
          return prevIndex + 1 < charArray.length ? prevIndex + 1 : undefined;
        });
      }, 400);

      return () => clearTimeout(timer);
    }

    console.log(letterImageMap[(textResult[currentIndex])])
  }, [currentIndex, charArray]);

  // Play animation
  function playAnimation() {
    setCurrentIndex(0);
  }

  // Render screen
  return (
    <SafeAreaView className="flex-1">
      {/* HEADER */}
      <Stack.Screen
        options={{
          title: 'Audio to Sign'
        }}
      />
      {/* MAIN VIEW */}
        <View className="flex-1 py-5 items-center bg-white">
          {/* START RECORDING */}
          <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
          {/* RECORDING STATUS */}
          {recording && (
            <Text className="text-center">
              Recording: {formatDuration(recordDuration * 1000)}
            </Text>
          )}
          {recordedAudio && !recording && (
            <View className="items-center">
              {/* RECORDING PLAYBACK */}
              <Button title="Play Recording" onPress={playSound} disabled={isPlaying} />
              <View className="w-screen px-12 mt-2">
                <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View className="bg-blue-300 h-full" style={{ width: `${(playbackPosition / playbackDuration) * 104}%` }} />
                </View>
              </View>
              <Text className="text-xs text-gray-500 mt-2">
                {formatDuration(playbackPosition)} / {formatDuration(playbackDuration)}
              </Text>
              {/* SUBMIT RECORDING */}
              { textResult ? (
                <View className="mt-10">
                  <Button title="Play animation" onPress={playAnimation} />
                </View>
              ): (
                <View className="mt-10">
                  <Button title="Submit Recording" onPress={submitRecording} />
                </View>
              )}
              {/* CHECK TEXT */}
              { textResult && currentIndex !== undefined && (
                <View
                  className="flex-wrap justify-center items-center mx-6 bg-gray-200 px-6 py-3 rounded-lg"
                >
                  <Text
                    style={{
                      fontSize: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Text className="text-primary">
                      {textResult.substring(0, currentIndex + 1)}
                    </Text>
                    <Text>
                      {textResult.substring(currentIndex + 1)}
                    </Text>
                  </Text>
                </View>
              )}
              {/* RESULTS */}
              { textResult !== undefined && currentIndex !== undefined && (
                <View
                  className="w-screen mt-5 bg-red-100 p-5 items-center"
                  style={{ backgroundColor: '#ffffe0'}}
                >
                  <Image
                    source={letterImageMap[(textResult[currentIndex])]}
                    style={{ width: 200, height: 200, resizeMode: 'contain'}}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
  );
};

export default TextToSign;
