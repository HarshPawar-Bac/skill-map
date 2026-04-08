"use client";

import { useState, useRef } from "react";
import { FiUpload, FiVideo, FiCheck, FiX } from "react-icons/fi";
import { useGetVideoUploadUrl } from "@/hooks/useEvidence";
import toast from "react-hot-toast";

interface VideoUploadProps {
  skillId: string;
  onUploadComplete: (s3Key: string, videoUrl: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export default function VideoUpload({
  skillId,
  onUploadComplete,
}: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = useGetVideoUploadUrl(skillId);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error("Please upload a video file (MP4, WebM, or MOV)");
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 50MB");
      return;
    }

    setFile(selectedFile);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { upload_url, s3_key } = await getUploadUrl.mutateAsync({
        content_type: file.type,
        file_size: file.size,
      });

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          setUploadComplete(true);
          // Generate the video URL from the S3 key
          const videoUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${s3_key}`;
          onUploadComplete(s3_key, videoUrl);
          toast.success("Video uploaded successfully!");
        } else {
          throw new Error("Upload failed");
        }
        setIsUploading(false);
      });

      xhr.addEventListener("error", () => {
        toast.error("Upload failed. Please try again.");
        setIsUploading(false);
      });

      xhr.open("PUT", upload_url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Video Demo <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Upload a short video (max 50MB) demonstrating your skill
      </p>

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">MP4, WebM, or MOV (max 50MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FiVideo className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              {isUploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadComplete && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <FiCheck className="w-4 h-4" />
                  Upload complete
                </div>
              )}
            </div>

            {!isUploading && !uploadComplete && (
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isUploading && !uploadComplete && (
            <button
              onClick={handleUpload}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Upload Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
