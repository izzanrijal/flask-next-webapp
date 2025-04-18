import { useForm } from 'react-hook-form';
import { GeneratedQuestion } from '../types/question';
import { Save, X } from 'lucide-react';

interface QuestionFormProps {
  initialData: GeneratedQuestion;
  onSubmit: (data: GeneratedQuestion) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function QuestionForm({ initialData, onSubmit, onCancel, isSubmitting }: QuestionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch
  } = useForm<GeneratedQuestion>({
    defaultValues: initialData
  });

  const correctAnswer = watch('correct_answer');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {(Object.keys(errors).length > 0) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          Please fill all required fields correctly
        </div>
      )}

      <div>
        <label htmlFor="scenario" className="form-label">Scenario</label>
        <textarea
          id="scenario"
          rows={4}
          className={`form-input ${errors.scenario ? 'border-red-500' : ''}`}
          placeholder="Enter scenario"
          {...register('scenario', { required: true })}
        />
        {errors.scenario && <p className="text-sm text-red-600 mt-1">Scenario is required</p>}
      </div>

      <div>
        <label htmlFor="question" className="form-label">Question</label>
        <textarea
          id="question"
          rows={2}
          className={`form-input ${errors.question ? 'border-red-500' : ''}`}
          placeholder="Enter question"
          {...register('question', { required: true })}
        />
        {errors.question && <p className="text-sm text-red-600 mt-1">Question is required</p>}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="option_a" className="form-label">Option A</label>
          <input
            type="text"
            id="option_a"
            className={`form-input ${errors.option_a ? 'border-red-500' : ''}`}
            placeholder="Enter option A"
            {...register('option_a', { required: true })}
          />
          {errors.option_a && <p className="text-sm text-red-600 mt-1">Option A is required</p>}
        </div>

        <div>
          <label htmlFor="option_b" className="form-label">Option B</label>
          <input
            type="text"
            id="option_b"
            className={`form-input ${errors.option_b ? 'border-red-500' : ''}`}
            placeholder="Enter option B"
            {...register('option_b', { required: true })}
          />
          {errors.option_b && <p className="text-sm text-red-600 mt-1">Option B is required</p>}
        </div>

        <div>
          <label htmlFor="option_c" className="form-label">Option C</label>
          <input
            type="text"
            id="option_c"
            className={`form-input ${errors.option_c ? 'border-red-500' : ''}`}
            placeholder="Enter option C"
            {...register('option_c', { required: true })}
          />
          {errors.option_c && <p className="text-sm text-red-600 mt-1">Option C is required</p>}
        </div>

        <div>
          <label htmlFor="option_d" className="form-label">Option D</label>
          <input
            type="text"
            id="option_d"
            className={`form-input ${errors.option_d ? 'border-red-500' : ''}`}
            placeholder="Enter option D"
            {...register('option_d', { required: true })}
          />
          {errors.option_d && <p className="text-sm text-red-600 mt-1">Option D is required</p>}
        </div>

        <div>
          <label htmlFor="option_e" className="form-label">Option E</label>
          <input
            type="text"
            id="option_e"
            className={`form-input ${errors.option_e ? 'border-red-500' : ''}`}
            placeholder="Enter option E"
            {...register('option_e', { required: true })}
          />
          {errors.option_e && <p className="text-sm text-red-600 mt-1">Option E is required</p>}
        </div>
      </div>

      <div>
        <label htmlFor="correct_answer" className="form-label">Correct Answer</label>
        <select
          id="correct_answer"
          className={`form-input ${errors.correct_answer ? 'border-red-500' : ''}`}
          {...register('correct_answer', { 
            required: true,
            validate: value => ['A', 'B', 'C', 'D', 'E'].includes(value)
          })}
        >
          <option value="">Select correct answer</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </select>
        {errors.correct_answer && <p className="text-sm text-red-600 mt-1">Correct answer is required</p>}
      </div>

      <div>
        <label htmlFor="discussion" className="form-label">Discussion</label>
        <textarea
          id="discussion"
          rows={4}
          className={`form-input ${errors.discussion ? 'border-red-500' : ''}`}
          placeholder="Enter discussion"
          {...register('discussion', { required: true })}
        />
        {errors.discussion && <p className="text-sm text-red-600 mt-1">Discussion is required</p>}
      </div>

      <div>
        <label htmlFor="learning_objective" className="form-label">Learning Objective</label>
        <textarea
          id="learning_objective"
          rows={2}
          className={`form-input ${errors.learning_objective ? 'border-red-500' : ''}`}
          placeholder="Enter learning objective"
          {...register('learning_objective', { required: true })}
        />
        {errors.learning_objective && <p className="text-sm text-red-600 mt-1">Learning objective is required</p>}
      </div>

      <div className="flex space-x-3 pt-2 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary ml-auto"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default QuestionForm;