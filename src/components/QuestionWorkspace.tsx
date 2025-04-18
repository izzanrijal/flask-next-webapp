import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuestionById, generateQuestion, updateQuestion } from '../api/questions';
import LoadingSpinner from './LoadingSpinner';
import ProgressDashboard from './ProgressDashboard';
import QuestionDetails from './QuestionDetails';
import QuestionForm from './QuestionForm';
import SuccessModal from './SuccessModal';
import { ArrowLeft, ArrowRight, RefreshCw, Edit, Check, X, SlidersHorizontal } from 'lucide-react';
import { Question, GeneratedQuestion } from '../types/question';

interface QuestionWorkspaceProps {
  selectedQuestionId: number | null;
}

function QuestionWorkspace({ selectedQuestionId }: QuestionWorkspaceProps) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    data: question,
    isLoading,
    error
  } = useQuery({
    queryKey: ['question', selectedQuestionId],
    queryFn: () => fetchQuestionById(selectedQuestionId!),
    enabled: selectedQuestionId !== null
  });

  const generateMutation = useMutation({
    mutationFn: (question: Question) => generateQuestion(question),
    onSuccess: (data: GeneratedQuestion) => {
      setGeneratedQuestion(data);
    },
    onError: (error: any) => {
      console.error('Error generating question:', error);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, question }: { id: number, question: GeneratedQuestion }) => updateQuestion({ id, question }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', selectedQuestionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setShowSuccessModal(true);
      setIsEditing(false);
      setGeneratedQuestion(null);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.response?.data?.error || 'Failed to save changes');
    }
  });

  const handleGenerateQuestion = () => {
    if (!question) return;
    
    setIsGenerating(true);
    generateMutation.mutate(question);
  };

  const handleUpdateQuestion = (updatedQuestion: GeneratedQuestion) => {
    if (!selectedQuestionId) return;
    
    updateMutation.mutate({
      id: selectedQuestionId,
      question: updatedQuestion
    });
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleSkip = () => {
    setIsEditing(true);
    setGeneratedQuestion({
      scenario: '',
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      option_e: '',
      correct_answer: '',
      discussion: '',
      learning_objective: ''
    });
  };

  if (!selectedQuestionId) {
    return (
      <div className="w-full md:w-1/4 lg:w-4/12 flex flex-col">
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 mb-4 flex items-center justify-center text-gray-500">
          Select a question from the list to begin
        </div>
        <ProgressDashboard />
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/4 lg:w-4/12 flex flex-col">
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 mb-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-600 text-center p-4">
            Failed to load question. Please try again.
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-900">
                Question #{selectedQuestionId}
              </h2>
              <div className="flex space-x-2">
                <button
                  className="btn-outline p-2"
                  title="Previous Question"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  className="btn-outline p-2"
                  title="Next Question"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {isEditing ? (
              <QuestionForm 
                initialData={generatedQuestion || question!}
                onSubmit={handleUpdateQuestion}
                onCancel={() => {
                  setIsEditing(false);
                  setGeneratedQuestion(null);
                }}
                isSubmitting={updateMutation.isPending}
              />
            ) : (
              <>
                <QuestionDetails question={question!} />
                {generatedQuestion && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Generated Question
                    </h3>
                    <QuestionDetails question={generatedQuestion} isGenerated />
                    <div className="flex gap-2 mt-4">
                      <button
                        className="btn-primary"
                        onClick={() => handleUpdateQuestion(generatedQuestion)}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => setGeneratedQuestion(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={handleGenerateQuestion}
                disabled={isGenerating || generateMutation.isPending}
                className="btn-primary col-span-2"
              >
                {isGenerating || generateMutation.isPending ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Question
                  </>
                )}
              </button>
              <button
                onClick={handleSkip}
                className="btn-outline"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Skip & Create Manually
              </button>
            </div>
          </>
        )}
      </div>
      
      <ProgressDashboard />
      
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseSuccessModal} 
      />
    </div>
  );
}

export default QuestionWorkspace;