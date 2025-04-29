import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  BackHandler,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";

// Function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url:string) => {
  if (!url) return null;
  const regExp =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Function to generate custom HTML with YouTube embed
const getYoutubeHtml = (videoId: string, isFullscreen: boolean) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #000;
        }
        .container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        /* The blocker now covers the entire video */
        .blocker {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          z-index: 9999;
          display: none;
          pointer-events: none;
        }
        .replay-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: all;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .replay-icon {
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 20px 0 20px 40px;
          border-color: transparent transparent transparent #ffffff;
          margin-left: 8px;
        }
        /* Show blocker and replay when video ends */
        .active-blocker .blocker {
          display: block;
        }
        .active-blocker .replay-button {
          opacity: 1;
        }
      </style>
    </head>
    <body>
      <div class="container" id="container">
        <iframe 
          id="ytplayer"
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&showinfo=0&rel=0&modestbranding=1&controls=1&playsinline=1&enablejsapi=1&fs=0&iv_load_policy=3&origin=${encodeURIComponent('https://www.youtube.com')}&cc_load_policy=0&color=white&disablekb=1&loop=0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope"
          allowfullscreen="false"
        ></iframe>
        <div class="blocker" id="blocker">
          <div class="replay-button" id="replayButton">
            <div class="replay-icon"></div>
          </div>
        </div>
      </div>
      
      <script>
        // This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        var player;
        var container = document.getElementById('container');
        var replayButton = document.getElementById('replayButton');
        var blockRelatedVideos = true;
        
        function onYouTubeIframeAPIReady() {
          player = new YT.Player('ytplayer', {
            events: {
              'onStateChange': onPlayerStateChange,
              'onReady': onPlayerReady,
              'onError': onPlayerError
            }
          });
        }
        
        function onPlayerReady(event) {
          // Make sure we start clean
          container.classList.remove('active-blocker');
          
          // Send ready message to React Native
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ready'}));
        }
        
        function onPlayerError(event) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'error', code: event.data}));
        }
        
        function onPlayerStateChange(event) {
          // If video ended (state = 0), add active-blocker class to hide related videos
          if (event.data === 0) { // YT.PlayerState.ENDED
            if(blockRelatedVideos) {
              container.classList.add('active-blocker');
              // Send message to React Native
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'videoEnded'}));
            }
          } else if (event.data === 1) { // YT.PlayerState.PLAYING
            container.classList.remove('active-blocker');
            // Send message to React Native
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loading', isLoading: false}));
          } else if (event.data === 3) { // YT.PlayerState.BUFFERING
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loading', isLoading: true}));
          }
        }
        
        // Add replay button functionality
        replayButton.addEventListener('click', function() {
          if (player && typeof player.seekTo === 'function') {
            player.seekTo(0);
            player.playVideo();
            container.classList.remove('active-blocker');
          }
        });

        // Add extra insurance against related videos
        // Listen for messages from YouTube iframe
        window.addEventListener('message', function(event) {
          if (event.origin === 'https://www.youtube.com') {
            try {
              const data = JSON.parse(event.data);
              if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
                // Video ended - double check that blocker is active
                if(blockRelatedVideos) {
                  container.classList.add('active-blocker');
                }
              }
            } catch(e) {
              // Ignore parsing errors
            }
          }
        });
      </script>
    </body>
    </html>
  `;
};

export default function VideoDetails() {
  // Parameters and Router
  const params = useLocalSearchParams();
  const router = useRouter();
  const videoUrl = params.videoUrl as string;
  const title = params.title as string;

  // States
  const [youtubeVideoId, setYoutubeVideoId] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { width, height } = useWindowDimensions();

  // Ref
  const webViewRef = useRef(null);

  // Extract Video ID on mount
  useEffect(() => {
    const id = extractYouTubeVideoId(videoUrl);
    if (id) {
      setYoutubeVideoId(id);
    } else {
      setError("Invalid YouTube URL");
    }
  }, [videoUrl]);

  // --- Fullscreen Handling ---
  const enterFullscreen = async () => {
    setIsFullscreen(true);
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      StatusBar.setHidden(true);
    } catch (e) {
      console.error("Failed to lock orientation:", e);
      setIsFullscreen(false); // Revert state if failed
    }
  };

  const exitFullscreen = async () => {
    setIsFullscreen(false);
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT
      );
      StatusBar.setHidden(false);
    } catch (e) {
      console.error("Failed to unlock orientation:", e);
    }
  };

  // Handle hardware back press for exiting fullscreen
  useEffect(() => {
    const backAction = () => {
      if (isFullscreen) {
        exitFullscreen();
        return true; // Prevent default back behavior
      }
      return false; // Allow default back behavior
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isFullscreen]);

  // --- Handle WebView messages ---
  const handleWebViewMessage = (event:any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loading') {
        setIsLoading(data.isLoading);
      } else if (data.type === 'videoEnded') {
        // Do something when video ends if needed
      }
    } catch (e) {
      console.error('Error parsing WebView message', e);
    }
  };

  // --- Navigation ---
  const handleBack = () => {
    if (isFullscreen) {
      exitFullscreen(); // Prioritize exiting fullscreen
    } else {
      router.back(); // Normal back navigation
    }
  };

  // --- Render Logic ---
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderNormalMode = () => (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.videoContainer}>
        {youtubeVideoId ? (
          <WebView
            ref={webViewRef}
            source={{ html: getYoutubeHtml(youtubeVideoId, false) }}
            style={styles.video}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onMessage={handleWebViewMessage}
            allowsFullscreenVideo={false}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        
        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={enterFullscreen}
        >
          <Ionicons name="expand" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <ScrollView style={styles.infoContainer}>
        
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            Discription: {params.description || "This video doesn't have a description."}
          </Text>
        </View>

        <View  className="flex-1 flex-row items-center mb-4">
          <View  className='px-2 py-2 mr-2 mb-3' >
          <Text>
            Tags: 
          </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Technology</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Education</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Tutorial</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <>
      {isFullscreen ? (
        // Fullscreen Mode
        <View style={styles.fullscreenContainer}>
          <StatusBar hidden={true} />
          {youtubeVideoId ? (
            <WebView
              ref={webViewRef}
              source={{ html: getYoutubeHtml(youtubeVideoId, true) }}
              style={styles.fullscreenVideo}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              onMessage={handleWebViewMessage}
              allowsFullscreenVideo={false}
            />
          ) : (
            <View style={styles.fullscreenLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          
          {isLoading && (
            <View style={styles.fullscreenLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          
          <TouchableOpacity
            style={styles.exitFullscreenButton}
            onPress={exitFullscreen}
          >
            <Ionicons name="contract" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : renderNormalMode()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1
  },
  fullscreenButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 1
  },
  titleContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  infoContainer: {
    flex: 1,
    padding: 15,
  },
  authorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  authorInitial: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  authorInfo: {
    marginLeft: 10,
  },
  authorName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  authorStats: {
    color: "#666",
    fontSize: 14,
  },
  descriptionBox: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  statText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#9ECCCF",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#666",
    fontSize: 12,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  fullscreenLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  exitFullscreenButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    zIndex: 1
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  errorButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});