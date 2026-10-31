import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SuccessView = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand-bright/10 p-6 rounded-full mb-6">
        <CheckCircle2 className="text-brand-bright" size={64} />
      </div>
      <h2 className="text-2xl font-bold text-brand-deep mb-2">Story Saved!</h2>
      <p className="text-gray-600">Your memory has been safely tucked away in your chronicle.</p>
    </div>
  );
};

export default SuccessView;
