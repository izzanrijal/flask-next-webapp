import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import QuestionWorkspace from '../components/QuestionWorkspace';
import Sidebar from '../components/Sidebar';

function DashboardPage() {
  const { logout } = useAuth();
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Clinical Question Update</h1>
          <button onClick={logout} className="btn-outline">
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar 
          selectedSystemId={selectedSystemId}
          setSelectedSystemId={setSelectedSystemId}
          selectedQuestionId={selectedQuestionId}
          setSelectedQuestionId={setSelectedQuestionId}
        />
        <QuestionWorkspace 
          selectedQuestionId={selectedQuestionId}
        />
      </main>
    </div>
  );
}

export default DashboardPage;