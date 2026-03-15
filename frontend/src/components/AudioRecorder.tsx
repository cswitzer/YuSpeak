import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  Volume2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useState } from "react";

interface AudioRecorderUIProps {
  className?: string;
  maxDuration?: number;
  onAnalyze?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  isAnalyzing?: boolean;
}

export function AudioRecorderUI({
  className,
  maxDuration = 30,
  onAnalyze,
  onError,
  isAnalyzing = false,
}: AudioRecorderUIProps) {
  const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);

  const recorder = useAudioRecorder({
    maxDuration,
    onRecordingComplete: (blob) => {
      setCurrentAudioBlob(blob);
    },
    onError,
  });

  const {
    isRecording,
    isPaused,
    isPlaying,
    duration,
    volume,
    recordingComplete,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playRecording,
    pausePlayback,
    downloadRecording,
    clearRecording,
    formatDuration,
  } = recorder;

  // Calculate progress as percentage of max duration
  const progressPercentage = (duration / maxDuration) * 100;

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-center justify-center">
          <Mic className="h-5 w-5" />
          Audio Recorder
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Volume Meter (only visible when recording) */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Input Level</span>
            </div>
            <Progress value={volume * 100} className="h-2" />
          </div>
        )}

        {/* Duration Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span
              className={cn(
                "font-mono",
                duration >= maxDuration
                  ? "text-destructive"
                  : "text-foreground",
              )}
            >
              {formatDuration(duration)} / {formatDuration(maxDuration)}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={cn(
              "h-2 transition-colors",
              progressPercentage >= 90 ? "text-destructive" : "",
            )}
          />
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isPlaying || isAnalyzing}
            >
              <Mic className="h-4 w-4" />
              Record
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={resumeRecording} size="lg" variant="default">
                  <Mic className="h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseRecording} size="lg" variant="outline">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button onClick={stopRecording} size="lg" variant="destructive">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Recording Status Indicator */}
        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <div
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                isPaused ? "bg-orange-500" : "bg-red-500",
              )}
            />
            <span className="text-muted-foreground">
              {isPaused ? "Recording Paused" : "Recording..."}
            </span>
          </div>
        )}

        {/* Playback Controls (only visible when recording exists) */}
        {recordingComplete && audioUrl && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-center gap-2 flex-wrap">
              {!isPlaying ? (
                <Button
                  onClick={playRecording}
                  variant="outline"
                  disabled={isRecording || isAnalyzing}
                >
                  <Play className="h-4 w-4" />
                  Play
                </Button>
              ) : (
                <Button onClick={pausePlayback} variant="outline">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}

              <Button
                onClick={downloadRecording}
                variant="outline"
                disabled={isRecording || isAnalyzing}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>

              <Button
                onClick={() => {
                  clearRecording();
                  setCurrentAudioBlob(null);
                }}
                variant="outline"
                size="icon"
                disabled={isRecording || isAnalyzing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                onClick={() =>
                  currentAudioBlob && onAnalyze?.(currentAudioBlob)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isRecording || isAnalyzing || !currentAudioBlob}
                size="lg"
              >
                <Send className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze Speech"}
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Recording Complete Message */}
        {recordingComplete && !error && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 text-center">
              ✓ Recording complete! Play it back, then click "Analyze Speech" to
              get feedback.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
