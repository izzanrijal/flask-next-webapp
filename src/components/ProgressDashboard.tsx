import { useQuery } from '@tanstack/react-query';
import { fetchProgressStats } from '../api/questions';
import LoadingSpinner from './LoadingSpinner';

function ProgressDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['progressStats'],
    queryFn: fetchProgressStats
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[100px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[100px] flex items-center justify-center text-red-600">
        Failed to load progress data
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[100px] flex items-center justify-center text-gray-500">
        No progress data available
      </div>
    );
  }

  const { updatedCount, totalCount } = data;
  const percentComplete = totalCount > 0 ? Math.round((updatedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Dashboard</h3>
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Completion</span>
        <span className="text-sm font-medium">
          {updatedCount}/{totalCount} questions updated
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentComplete}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {percentComplete}% Complete
        </span>
        <span className="text-xs text-gray-500">
          {totalCount - updatedCount} Remaining
        </span>
      </div>
    </div>
  );
}

export default ProgressDashboard;