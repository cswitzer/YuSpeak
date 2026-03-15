import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AudioRecorderUI } from "./components/AudioRecorder";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AudioRecorderUI
          className="border border-slate-400"
          maxDuration={30}
          onRecordingComplete={(blob) => {
            console.log(blob);
          }}
          onError={(error) => console.error(error)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
