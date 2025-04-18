import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, RefreshCw, Search } from 'lucide-react';
import { fetchSystems, fetchQuestionsBySystem } from '../api/questions';
import LoadingSpinner from './LoadingSpinner';
import QuestionList from './QuestionList';

interface SidebarProps {
  selectedSystemId: number | null;
  setSelectedSystemId: (id: number | null) => void;
  selectedQuestionId: number | null;
  setSelectedQuestionId: (id: number | null) => void;
}

function Sidebar({
  selectedSystemId,
  setSelectedSystemId,
  selectedQuestionId,
  setSelectedQuestionId
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  
  const {
    data: systems,
    isLoading: isLoadingSystems,
    error: systemsError
  } = useQuery({
    queryKey: ['systems'],
    queryFn: fetchSystems
  });

  const {
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions
  } = useQuery({
    queryKey: ['questions', selectedSystemId, page],
    queryFn: () => fetchQuestionsBySystem(selectedSystemId, page),
    enabled: selectedSystemId !== null
  });

  // Reset pagination when system changes
  useEffect(() => {
    setPage(1);
  }, [selectedSystemId]);

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const systemId = parseInt(e.target.value);
    setSelectedSystemId(systemId);
    setSelectedQuestionId(null);
  };

  const filteredQuestions = questions?.filter(question => 
    question.id.toString().includes(searchQuery)
  );

  const loadMoreQuestions = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="w-full md:w-3/4 lg:w-8/12 bg-white rounded-lg shadow-sm p-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-900">Questions</h2>
        <button 
          onClick={() => refetchQuestions()} 
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="system" className="block text-sm font-medium text-gray-700 mb-1">
          System
        </label>
        <div className="relative">
          <select
            id="system"
            value={selectedSystemId || ''}
            onChange={handleSystemChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm appearance-none pr-8"
            disabled={isLoadingSystems}
          >
            <option value="">Select a system</option>
            {systems?.map(system => (
              <option key={system.id} value={system.id}>
                {system.topic}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="mb-4 relative">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Questions
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-9"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoadingSystems && (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        )}

        {systemsError && (
          <div className="p-4 text-red-600 text-center">
            Failed to load systems. Please try again.
          </div>
        )}

        {selectedSystemId && isLoadingQuestions && (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        )}

        {selectedSystemId && questionsError && (
          <div className="p-4 text-red-600 text-center">
            Failed to load questions. Please try again.
          </div>
        )}

        {selectedSystemId && filteredQuestions && (
          <QuestionList 
            questions={filteredQuestions}
            selectedQuestionId={selectedQuestionId}
            setSelectedQuestionId={setSelectedQuestionId}
          />
        )}

        {selectedSystemId && questions && questions.length >= 50 && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreQuestions}
              className="btn-outline text-sm"
              disabled={isLoadingQuestions}
            >
              {isLoadingQuestions ? <LoadingSpinner size="sm" /> : 'Load More'}
            </button>
          </div>
        )}

        {selectedSystemId && questions && questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions found
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;