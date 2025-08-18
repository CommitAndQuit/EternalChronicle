import React from 'react';
import { MapPin, Cloud, Clock, ChevronUp, ChevronDown } from 'lucide-react';

const MetadataBar = () => {
  return (
    <div className="p-4 bg-primary-background border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="environment" className="h-5 w-5 rounded text-accent focus:ring-accent" />
          <label htmlFor="environment" className="text-primary-text font-medium">Environment</label>
        </div>
        <div className="flex items-center gap-4 text-secondary-text">
          <MapPin size={20} />
          <Cloud size={20} />
          <Clock size={20} />
        </div>
        <div className="flex items-center text-secondary-text">
          <ChevronUp size={20} />
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};

export default MetadataBar;
