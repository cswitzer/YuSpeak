import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid">
        <div className="text-2xl font-bold">Yuspeak</div>
        <div className="text-2xl font-bold">Yuspeak</div>
        <div className="text-2xl font-bold">Yuspeak</div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
