import { CheckSquare, Square, FileCheck2, FileText } from 'lucide-react';

interface Question {
  id: number;
  already_updated: boolean;
  is_accepted: boolean;
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
            <span className="flex items-center gap-2">
              {/* Accepted icon: CheckSquare if accepted, Square if not */}
              {question.is_accepted ? (
                <CheckSquare size={18} className="text-green-600" />
              ) : (
                <Square size={18} className="text-gray-300" />
              )}
              {/* Updated icon: FileCheck2 if updated, FileText if not */}
              {question.already_updated ? (
                <FileCheck2 size={18} className="text-blue-600" />
              ) : (
                <FileText size={18} className="text-gray-300" />
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default QuestionList;