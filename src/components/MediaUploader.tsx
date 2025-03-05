
import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, RotateCw, Crop, Type, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface MediaUploaderProps {
  onMediaSelect: (file: File) => void;
  selectedMedia: File | null;
  previewUrl: string | null;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onMediaSelect, 
  selectedMedia, 
  previewUrl 
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, []);

  // File validation and handling
  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    const fileType = file.type;
    const fileSize = file.size / (1024 * 1024); // Convert to MB

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const isValidType = [...validImageTypes, ...validVideoTypes].includes(fileType);

    if (!isValidType) {
      toast.error("Invalid file type. Please upload JPG, PNG, GIF, MP4, WebM, or MOV files.");
      return;
    }

    // Validate file size
    if (fileSize > 50) {
      toast.error("File is too large. Maximum size is 50MB.");
      return;
    }

    onMediaSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onMediaSelect(null as any);
  };

  // Placeholder functions for future image/video editing features
  const handleRotate = () => toast("Rotate feature will be available soon!");
  const handleCrop = () => toast("Crop feature will be available soon!");
  const handleAddText = () => toast("Text overlay feature will be available soon!");
  
  // Determine if the selected file is a video
  const isVideo = selectedMedia?.type.startsWith('video/');

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white">
        Welcome, {currentUser?.displayName || 'User'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Upload your media or capture directly to get human-like AI-powered captions.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="flex flex-col">
          <div 
            ref={dropAreaRef}
            className={`
              relative border-2 border-dashed rounded-lg p-8
              flex flex-col items-center justify-center
              min-h-[250px] transition-all duration-200
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-primary dark:border-gray-600 dark:hover:border-primary'}
            `}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/quicktime"
              className="hidden"
            />
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Drag & drop your media here, or click to select
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports images and videos up to 50MB
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              onClick={handleUploadClick}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Media
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => toast("Camera access will be available soon!")}
            >
              <Camera className="h-4 w-4" />
              Use Camera
            </Button>
          </div>

          <div className="text-center mt-4">
            <span className="text-gray-500 dark:text-gray-400 text-sm">or</span>
            <button 
              className="block mx-auto text-primary text-sm hover:underline mt-1"
              onClick={() => toast("Text-only captions will be implemented in the next phase!")}
            >
              Create text-only caption
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${!previewUrl ? 'hidden lg:block opacity-50' : 'opacity-100'}`}>
          {previewUrl ? (
            <div className="relative h-full flex flex-col">
              <div className="absolute top-2 right-2 z-10">
                <button 
                  className="bg-gray-900/70 hover:bg-gray-900/90 text-white rounded-full p-1"
                  onClick={handleRemoveMedia}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative flex-grow bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {isVideo ? (
                  <video 
                    src={previewUrl} 
                    controls
                    className="max-h-[300px] max-w-full object-contain"
                  />
                ) : (
                  <img 
                    src={previewUrl}
                    alt="Preview" 
                    className="max-h-[300px] max-w-full object-contain"
                  />
                )}
              </div>
              
              <div className="p-3 border-t flex justify-center gap-4">
                <button 
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  onClick={handleRotate}
                >
                  <RotateCw className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  onClick={handleCrop}
                >
                  <Crop className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  onClick={handleAddText}
                >
                  <Type className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
                  onClick={handleRemoveMedia}
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <div className="text-gray-400 dark:text-gray-600">
                <div className="mx-auto w-20 h-20 mb-4 opacity-30">
                  <img src="/placeholder.svg" alt="No media selected" className="w-full h-full" />
                </div>
                <p>Media preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaUploader;
