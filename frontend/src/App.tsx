import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <p>Hello World</p>
      </div>
    </QueryClientProvider>
  );
}

export default App;
