import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AudioRecorderUI } from "@/components/AudioRecorder";
import { analyzeSpeech } from "@/services/speechService";
import { useState } from "react";
import { toast } from "sonner";

const queryClient = new QueryClient();

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (blob: Blob) => {
    try {
      setIsAnalyzing(true);
      toast.loading("Analyzing speech...");
      const result = await analyzeSpeech(blob);
      toast.success("Analysis complete!");
      console.log("Analysis result:", result);
    } catch (error) {
      toast.error("Failed to analyze speech.");
      console.error("Failed to analyze speech:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AudioRecorderUI
          className="border border-slate-400"
          maxDuration={30}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          onError={(error) => console.error(error)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
