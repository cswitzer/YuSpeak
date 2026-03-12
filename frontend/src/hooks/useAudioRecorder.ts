import { useState, useRef, useCallback } from "react";

interface UseAudioRecorderOptions {
  maxDuration?: number;
  onRecordingComplete?: (audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onError?: (error: string) => void;
}

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  duration: number;
  volume: number;
  recordingComplete: boolean;
  audioUrl: string | null;
  error: string | null;
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  playRecording: () => void;
  pausePlayback: () => void;
  downloadRecording: () => void;
  clearRecording: () => void;
  formatDuration: (duration: number) => string;
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const {
    maxDuration = 30,
    onRecordingComplete,
    onRecordingStart,
    onRecordingStop,
    onError,
  } = options;

  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    duration: 0,
    volume: 0,
    recordingComplete: false,
    audioUrl: null,
    error: null,
  });

  // ===== Recording =====

  // MediaRecorder instance responsible for capturing microphone audio.
  // Created when recording starts and used to control recording
  // (start, pause, resume, stop).
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Stores the small audio chunks produced while recording.
  // When recording stops, these chunks are combined into a single Blob
  // that represents the final recorded audio.
  const audioChunksRef = useRef<Blob[]>([]);

  // The active microphone stream obtained from getUserMedia().
  // Stored so we can stop the microphone tracks when recording ends,
  // which releases the user's microphone.
  const streamRef = useRef<MediaStream | null>(null);

  // ===== Audio Analysis (Volume Meter) =====

  // Provides access to the live microphone audio so it can be analyzed
  // while recording. This enables features like a real-time volume meter.
  const audioContextRef = useRef<AudioContext | null>(null);

  // Analyzes the microphone signal to determine how loud it currently is.
  // The measured value is typically used to render a visual volume meter.
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Stores the animation loop used to repeatedly measure microphone volume
  // so the volume meter updates smoothly while recording. Typically used in animations,
  // but we borrow it here since it is more efficient than setInterval for high
  // frequency tasks such as monitoring volume
  const animationRef = useRef<number | null>(null);

  // ===== Timer =====

  // Timer used to track how long the recording has been running.
  // The interval ID is stored so the timer can be cleared when recording stops.
  const intervalRef = useRef<number | null>(null);

  // ===== Playback =====

  // Audio element used to play back the recorded audio.
  // Stored so playback can be controlled (play, pause, etc.).
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const updateState = useCallback((updates: Partial<AudioRecorderState>) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  const startVolumeMonitoring = useCallback(() => {
    const monitorVolume = () => {
      if (!analyserRef.current) return;

      // Essentially, we are filling an array here that represents the current "loudness" of the data
      // which is essentialy for the volume meter
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const volume =
        dataArray.reduce((sum, value) => sum + value, 0) /
        dataArray.length /
        255;
      updateState({ volume });

      // schedule to run this function again (~60fps for smooth volume updates)
      animationRef.current = requestAnimationFrame(monitorVolume);
    };
    monitorVolume();
  }, [updateState]);

  const startRecording = useCallback(async () => {
    if (state.isRecording) {
      onError?.("Recording is already in progress.");
      return;
    }

    try {
      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create a MediaRecorder to capture the audio stream
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up MediaRecorder event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        updateState({
          recordingComplete: true,
          audioUrl,
        });
        onRecordingComplete?.(audioBlob);
      };

      // Connect the microphone to the analyzer so it can listen to the audio
      // useful for the audio meter
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start volume monitoring
      startVolumeMonitoring();

      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        // runs every second to calculate how much time has passed
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateState({ duration: elapsed });

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      audioChunksRef.current = [];

      mediaRecorder.start(100); // Collect data every 100ms

      updateState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        volume: 0,
        recordingComplete: false,
        audioUrl: null,
        error: null,
      });

      onRecordingStart?.();
    } catch (err) {
      onError?.("Could not access microphone: " + (err as Error).message);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isRecording,
    onError,
    updateState,
    onRecordingStart,
    startVolumeMonitoring,
    onRecordingComplete,
    maxDuration,
  ]);

  const stopRecording = useCallback(() => {
    if (!state.isRecording) {
      onError?.("No recording is in progress.");
      return;
    }

    // Stop MediaRecorder
    mediaRecorderRef.current?.stop();

    // Stop microphone stream
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    // Clean up timers and animation frames
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;

    updateState({
      isRecording: false,
      isPaused: false,
      volume: 0,
    });

    onRecordingStop?.();
  }, [state.isRecording, onError, updateState, onRecordingStop]);

  const pauseRecording = useCallback(() => {
    if (!state.isRecording) {
      onError?.("No recording is in progress.");
      return;
    }

    if (state.isPaused) {
      onError?.("Recording is already paused.");
      return;
    }

    mediaRecorderRef?.current?.pause();

    // pause duration timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // pause volume monitoring
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    updateState({
      isPaused: true,
      volume: 0,
    });
  }, [state.isRecording, state.isPaused, onError, updateState]);

  const resumeRecording = useCallback(() => {
    if (!state.isPaused) {
      onError?.("Recording is not paused");
      return;
    }

    mediaRecorderRef?.current?.resume();

    // Resume volume monitoring
    startVolumeMonitoring();

    // Resume timer from current duration
    const resumeTime = Date.now();
    const currentDuration = state.duration;
    intervalRef.current = setInterval(() => {
      const elapsed =
        currentDuration + Math.floor((Date.now() - resumeTime) / 1000);
      updateState({ duration: elapsed });

      if (elapsed >= maxDuration) {
        stopRecording();
      }
    }, 1000);

    updateState({ isPaused: false });
  }, [
    state.isPaused,
    state.duration,
    startVolumeMonitoring,
    updateState,
    onError,
    maxDuration,
    stopRecording,
  ]);

  const playRecording = useCallback(() => {
    if (!state.audioUrl) {
      onError?.("No recording available to play");
      return;
    }

    if (state.isPlaying) {
      onError?.("Audio is already playing");
      return;
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(state.audioUrl);
    }

    audioElementRef.current.currentTime = 0;
    audioElementRef.current.play();
    audioElementRef.current.onplay = () => {
      updateState({ isPlaying: true });
    };

    audioElementRef.current.onended = () => {
      updateState({ isPlaying: false });
    };

    audioElementRef.current.onerror = () => {
      onError?.("Error playing audio");
      updateState({ isPlaying: false });
    };
  }, [state.audioUrl, state.isPlaying, onError, updateState]);

  const pausePlayback = useCallback(() => {
    if (!state.isPlaying) {
      onError?.("No audio is currently playing");
      return;
    }

    audioElementRef.current?.pause();
    updateState({ isPlaying: false });
  }, [state.isPlaying, onError, updateState]);

  const downloadRecording = useCallback(() => {
    if (!state.audioUrl) {
      onError?.("No recording available to download");
      return;
    }

    const link = document.createElement("a");
    link.href = state.audioUrl;
    link.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.audioUrl, onError]);

  const clearRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    }

    if (state.isPlaying) {
      audioElementRef.current?.pause();
    }

    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    audioElementRef.current = null;

    updateState({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 0,
      volume: 0,
      recordingComplete: false,
      audioUrl: null,
      error: null,
    });

    audioChunksRef.current = [];
  }, [
    state.audioUrl,
    state.isPlaying,
    state.isRecording,
    stopRecording,
    updateState,
  ]);

  const formatDuration = useCallback((duration: number): string => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playRecording,
    pausePlayback,
    downloadRecording,
    clearRecording,
    formatDuration,
  };
}
