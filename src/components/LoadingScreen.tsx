import { Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
      </div>
    </div>
  );
}

export default LoadingScreen;