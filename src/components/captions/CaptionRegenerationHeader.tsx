
import React from 'react';
import { Button } from "@/components/ui/button";

interface CaptionRegenerationHeaderProps {
  requestsRemaining: number | null;
  onRegenerateClick: () => void;
}

const CaptionRegenerationHeader: React.FC<CaptionRegenerationHeaderProps> = ({ 
  requestsRemaining, 
  onRegenerateClick 
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold dark:text-white">Choose Your Caption</h2>
      <div className="flex items-center gap-4">
        {requestsRemaining !== null && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {requestsRemaining} requests remaining
          </span>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRegenerateClick}
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
};

export default CaptionRegenerationHeader;
