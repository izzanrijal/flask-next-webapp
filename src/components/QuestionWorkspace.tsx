import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchQuestionById, generateQuestion, updateQuestion, updateIsAccepted, fetchQuestionBefore } from '../api/questions';
import LoadingSpinner from './LoadingSpinner';
import ProgressDashboard from './ProgressDashboard';
import QuestionDetails from './QuestionDetails';
import QuestionForm from './QuestionForm';
import SuccessModal from './SuccessModal';
import { ArrowLeft, ArrowRight, RefreshCw, Edit, Check, X, SlidersHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Question, GeneratedQuestion } from '../types/question';
import { useEffect } from 'react';

interface QuestionWorkspaceProps {
  selectedQuestionId: number | null;
}

function QuestionWorkspace({ selectedQuestionId }: QuestionWorkspaceProps) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [beforeQuestion, setBeforeQuestion] = useState<Question | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const {
    data: question,
    isLoading,
    error
  } = useQuery({
    queryKey: ['question', selectedQuestionId],
    queryFn: () => fetchQuestionById(selectedQuestionId!),
    enabled: selectedQuestionId !== null
  });

  useEffect(() => {
    if (selectedQuestionId) {
      fetchQuestionBefore(selectedQuestionId)
        .then(setBeforeQuestion)
        .catch(() => setBeforeQuestion(null));
    }
  }, [selectedQuestionId]);

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

  const acceptMutation = useMutation({
    mutationFn: ({ id, is_accepted }: { id: number, is_accepted: boolean }) => updateIsAccepted(id, is_accepted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', selectedQuestionId] });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    }
  });

  const handleGenerateQuestion = () => {
    if (!question) return;
    
    setIsGenerating(true);
    generateMutation.mutate(question);
  };

  const handleToggleAccept = () => {
    if (!question) return;
    // Optimistically update UI
    queryClient.setQueryData(['question', selectedQuestionId], {
      ...question,
      is_accepted: !question.is_accepted
    });
    queryClient.setQueryData(['questions'], (old: any) => {
      if (!old) return old;
      return old.map((q: any) => q.id === question.id ? { ...q, is_accepted: !q.is_accepted } : q);
    });
    acceptMutation.mutate({ id: question.id, is_accepted: !question.is_accepted });
  };

  const handleUpdateQuestion = (updatedQuestion: GeneratedQuestion) => {
    if (!question) return;
    // Optimistically update UI
    queryClient.setQueryData(['question', selectedQuestionId], {
      ...question,
      ...updatedQuestion,
      already_updated: true
    });
    queryClient.setQueryData(['questions'], (old: any) => {
      if (!old) return old;
      return old.map((q: any) => q.id === question.id ? { ...q, already_updated: true } : q);
    });
    updateMutation.mutate({ id: question.id, question: updatedQuestion });
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
      learning_objective: '',
      is_accepted: false
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 mb-4 overflow-y-auto max-w-4xl mx-auto min-h-[600px]">
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
              <div className="flex space-x-2 items-center">
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

            {/* Status Preview Accepted & Updated */}
            {question && (
              <div className="mb-2 flex items-center gap-4">
                {/* Accepted Indicator */}
                {question.is_accepted ? (
                  <span className="flex items-center text-green-600 text-xs font-semibold">
                    <CheckCircle size={16} className="mr-1" />
                    Accepted
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 text-xs font-semibold">
                    <XCircle size={16} className="mr-1" />
                    Not Accepted
                  </span>
                )}
                {/* Updated Indicator */}
                {question.already_updated ? (
                  <span className="flex items-center text-blue-600 text-xs font-semibold">
                    <CheckCircle size={16} className="mr-1" />
                    Updated
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400 text-xs font-semibold">
                    <XCircle size={16} className="mr-1" />
                    Not Updated
                  </span>
                )}
              </div>
            )}

            {/* Toggle Slider Accept Below Navigation */}
            {question && (
              <div className="mb-4 flex items-center gap-4">
                <span className="text-xs font-semibold text-gray-700">Accepted</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!question.is_accepted}
                    onChange={handleToggleAccept}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>
            )}

            {/* Subtopic List Display */}
            {question?.subtopic_list && (
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {question.subtopic_list}
                </span>
              </div>
            )}

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

            {/* Preview Before (Original) */}
            {beforeQuestion && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Original Question (Before Generation)</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <QuestionDetails question={beforeQuestion} />
                </div>
              </div>
            )}
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