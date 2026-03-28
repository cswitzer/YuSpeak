import { QueryClient, useMutation } from "@tanstack/react-query";
import { AudioRecorderUI } from "@/components/AudioRecorder";
import FeedbackResults from "@/components/FeedbackResults";
import { analyzeSpeech } from "@/services/speechService";
import { toast } from "sonner";

function App() {
  const analyzeMutation = useMutation({
    mutationFn: analyzeSpeech,
    onMutate: () => {
      toast.loading("Analyzing speech...");
    },
    onSuccess: () => {
      toast.success("Analysis complete!");
    },
    onError: () => {
      toast.error("Failed to analyze speech.");
    },
  });

  const handleAnalyze = async (blob: Blob) => {
    analyzeMutation.mutate(blob);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <AudioRecorderUI
        className="border border-slate-400"
        maxDuration={30}
        onAnalyze={handleAnalyze}
        isAnalyzing={analyzeMutation.isPending}
        onError={(error) => console.error(error)}
      />
      {analyzeMutation.data && (
        <FeedbackResults analysis={analyzeMutation.data} />
      )}
    </div>
  );
}

export default App;
