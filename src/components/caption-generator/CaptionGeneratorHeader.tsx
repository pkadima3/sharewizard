
import React from 'react';

const CaptionGeneratorHeader: React.FC = () => {
  return (
    <div className="px-4 py-[100px]">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center">
        Caption Generator
      </h1>
      <p className="mt-2 text-gray-300 text-center max-w-2xl mx-auto">
        Create engaging captions for your social media posts with AI assistance
      </p>
    </div>
  );
};

export default CaptionGeneratorHeader;
