import { CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: number;
  already_updated: boolean;
}

interface QuestionListProps {
  questions: Question[];
  selectedQuestionId: number | null;
  setSelectedQuestionId: (id: number) => void;
}

function QuestionList({ 
  questions, 
  selectedQuestionId, 
  setSelectedQuestionId 
}: QuestionListProps) {
  return (
    <ul className="space-y-1">
      {questions.map((question) => (
        <li key={question.id}>
          <button
            onClick={() => setSelectedQuestionId(question.id)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between transition-colors ${
              selectedQuestionId === question.id
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-sm font-medium">Question #{question.id}</span>
            {question.already_updated ? (
              <span className="flex items-center text-green-600 text-xs">
                <CheckCircle size={16} className="mr-1" />
                Updated
              </span>
            ) : (
              <span className="flex items-center text-red-600 text-xs">
                <XCircle size={16} className="mr-1" />
                Pending
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;