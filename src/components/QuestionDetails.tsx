import { Question } from '../types/question';

interface QuestionDetailsProps {
  question: Question;
  isGenerated?: boolean;
}

function QuestionDetails({ question, isGenerated = false }: QuestionDetailsProps) {
  const {
    scenario,
    image_url,
    question: questionText,
    option_a,
    option_b,
    option_c,
    option_d,
    option_e,
    correct_answer,
    discussion,
    learning_objective
  } = question;

  const options = [
    { label: 'A', text: option_a },
    { label: 'B', text: option_b },
    { label: 'C', text: option_c },
    { label: 'D', text: option_d },
    { label: 'E', text: option_e }
  ];

  return (
    <div className={`space-y-4 ${isGenerated ? 'bg-blue-50 p-3 rounded-md' : ''}`}>
      {!isGenerated && image_url && (
        <div className="mb-4">
          <img
            src={image_url}
            alt="Question reference"
            className="max-w-full max-h-48 object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
            }}
          />
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Scenario:</h4>
        <p className="text-sm text-gray-800 whitespace-pre-line">{scenario}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Question:</h4>
        <p className="text-sm text-gray-800">{questionText}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Options:</h4>
        <ul className="space-y-1">
          {options.map((option) => (
            <li 
              key={option.label} 
              className={`text-sm ${option.label === correct_answer ? 'font-bold text-green-700' : 'text-gray-800'}`}
            >
              {option.label}. {option.text}
              {option.label === correct_answer && ' (Correct)'}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Discussion:</h4>
        <p className="text-sm text-gray-800 whitespace-pre-line">{discussion}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Learning Objective:</h4>
        <p className="text-sm text-gray-800">{learning_objective}</p>
      </div>
    </div>
  );
}

export default QuestionDetails;