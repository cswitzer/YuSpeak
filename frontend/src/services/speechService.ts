import { api } from "@/lib/api";

interface Mistake {
  type: string;
  original: string;
  corrected: string;
  explanation: string;
}

interface EvaluationResponse {
  overall_score: number;
  grammar_score: number;
  vocabulary_score: number;
  fluency_score: number;
  mistakes: Mistake[];
  original_sentence: string;
  corrected_sentence: string;
  more_natural_native_version: string;
  overall_feedback: string;
}

interface Phoneme {
  phoneme: string;
  score: number;
}

interface WordPronunciation {
  word: string;
  score: number;
  error: string;
  phonemes: Phoneme[];
}

interface PronunciationResult {
  overall: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  words: WordPronunciation[];
}

export interface AnalysisResponse {
  evaluation: EvaluationResponse;
  pronunciation: PronunciationResult | null;
}

export const analyzeSpeech = async (
  audioBlob: Blob,
): Promise<AnalysisResponse> => {
  const formData = new FormData();

  // Create a file from the blob with a proper name
  const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
    type: audioBlob.type || "audio/webm",
  });

  formData.append("file", audioFile);

  const response = await api.post<AnalysisResponse>(
    "/speech/analyze",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 seconds for audio processing
    },
  );

  return response.data;
};
