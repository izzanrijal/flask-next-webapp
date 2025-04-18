import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-in">
        <div className="flex flex-col items-center text-center">
          <div className="bg-green-100 rounded-full p-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Success!
          </h3>
          <p className="text-gray-600 mb-6">
            The question has been successfully updated in the database.
          </p>
          <button
            onClick={onClose}
            className="btn-primary w-full sm:w-auto"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;