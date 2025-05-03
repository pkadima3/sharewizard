
import React, { useRef } from 'react';
import { GeneratedCaption } from '@/types/captionTypes';
import CaptionsList from './CaptionsList';
import CaptionEditor from './CaptionEditor';
import CaptionSharingActions from './CaptionSharingActions';
import useMediaType from '@/hooks/useMediaType';

interface CaptionContentProps {
  selectedMedia: File | null;
  previewUrl: string | null;
  captions: GeneratedCaption[];
  selectedCaption: number;
  setSelectedCaption: React.Dispatch<React.SetStateAction<number>>;
  setCaptions: React.Dispatch<React.SetStateAction<GeneratedCaption[]>>;
  isTextOnly: boolean;
  captionOverlayMode: 'overlay' | 'below';
  onCaptionOverlayModeChange?: (mode: 'overlay' | 'below') => void;
  selectedPlatform: string;
}

const CaptionContent: React.FC<CaptionContentProps> = ({
  selectedMedia,
  previewUrl,
  captions,
  selectedCaption,
  setSelectedCaption,
  setCaptions,
  isTextOnly,
  captionOverlayMode,
  onCaptionOverlayModeChange,
  selectedPlatform
}) => {
  const [isSharing, setIsSharing] = React.useState<boolean>(false);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const mediaType = useMediaType(isTextOnly, selectedMedia);
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-2/5">
        <CaptionsList 
          captions={captions}
          selectedCaption={selectedCaption}
          setSelectedCaption={setSelectedCaption}
        />
      </div>
      
      <div className="lg:w-3/5">
        <div className="sticky top-6 space-y-4">
          <CaptionEditor
            selectedMedia={selectedMedia}
            previewUrl={previewUrl}
            captions={captions}
            selectedCaption={selectedCaption}
            setCaptions={setCaptions}
            isTextOnly={isTextOnly}
            captionOverlayMode={captionOverlayMode}
            onCaptionOverlayModeChange={onCaptionOverlayModeChange}
            onShareClick={() => {
              if (previewRef.current) {
                setIsSharing(true);
              } else {
                console.error("Preview ref is null");
              }
            }}
            onDownloadClick={() => {
              if (previewRef.current) {
                setIsDownloading(true);
              } else {
                console.error("Preview ref is null");
              }
            }}
            isSharing={isSharing}
            isDownloading={isDownloading}
          />
          
          <CaptionSharingActions
            previewRef={previewRef}
            captions={captions}
            selectedCaption={selectedCaption}
            isEditing={isEditing}
            isSharing={isSharing}
            setIsSharing={setIsSharing}
            isDownloading={isDownloading}
            setIsDownloading={setIsDownloading}
            selectedPlatform={selectedPlatform}
            previewUrl={previewUrl}
            mediaType={mediaType}
            captionOverlayMode={captionOverlayMode}
          />
        </div>
      </div>
    </div>
  );
};

export default CaptionContent;
