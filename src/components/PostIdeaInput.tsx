
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PostIdeaInputProps {
  postIdea: string;
  onPostIdeaChange: (idea: string) => void;
}

const PostIdeaInput: React.FC<PostIdeaInputProps> = ({ 
  postIdea, 
  onPostIdeaChange 
}) => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Describe Your Post</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            What is your post about? Describe it in a few sentences.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="post-idea" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Content/Idea
          </Label>
          <Textarea
            id="post-idea"
            placeholder="Describe what your post is about. For example: A behind-the-scenes look at our new product launch, photos from our team retreat, etc."
            className="min-h-[150px] resize-y"
            value={postIdea}
            onChange={(e) => onPostIdeaChange(e.target.value)}
          />
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          <p>Adding a detailed description helps generate more relevant captions.</p>
        </div>
      </div>
    </div>
  );
};

export default PostIdeaInput;
