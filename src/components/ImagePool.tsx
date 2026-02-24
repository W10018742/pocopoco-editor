import React, { useState } from "react";
import type { PoolImage } from "../types";

interface ImagePoolProps {
  images: PoolImage[];
  onFileUploadClick: () => void;
  onUrlAddClick: () => void;
  onAiGenerateClick: () => void;
  onDragStartFromPool: (e: React.DragEvent, image: PoolImage) => void;
  onDeleteImage: (id: string) => void;
}

function UploadStatusBadge({ status }: { status: PoolImage["uploadStatus"] }) {
  if (status === "uploading") {
    return (
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-md">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
        <svg
          className="w-2.5 h-2.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-white text-[10px] font-bold leading-none">!</span>
      </div>
    );
  }

  return null;
}

function PoolImageItem({
  image,
  onDragStart,
  onDelete,
}: {
  image: PoolImage;
  onDragStart: (e: React.DragEvent, image: PoolImage) => void;
  onDelete: (id: string) => void;
}) {
  const [broken, setBroken] = useState(false);
  const isUploading = image.uploadStatus === "uploading";
  const disabled = isUploading || broken;

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        onDragStart(e, image);
      }}
      className={`relative w-[60px] h-[60px] rounded-md overflow-hidden shrink-0 ${
        broken
          ? "cursor-default"
          : isUploading
            ? "cursor-wait"
            : "cursor-grab"
      }`}
    >
      {broken ? (
        <div className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-400 text-lg">
          ⚠️
        </div>
      ) : (
        <img
          src={image.src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      )}
      {broken && (
        <button
          onClick={() => onDelete(image.id)}
          className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-bl-md border-none text-white text-[10px] leading-none cursor-pointer flex items-center justify-center p-0"
        >
          ✕
        </button>
      )}
      <UploadStatusBadge status={image.uploadStatus} />
    </div>
  );
}

export function ImagePool({
  images,
  onFileUploadClick,
  onUrlAddClick,
  onAiGenerateClick,
  onDragStartFromPool,
  onDeleteImage,
}: ImagePoolProps) {
  return (
    <div className="bg-surface-secondary border-b border-edge px-5 py-3">
      <div className="flex justify-between items-center mb-2.5 text-[0.85rem] text-content-secondary">
        <span>📷 이미지 풀</span>
        <div className="flex gap-2">
          <button
            onClick={onFileUploadClick}
            className="px-3 py-1.5 rounded-md border border-edge bg-transparent text-violet-400 cursor-pointer text-[0.8rem]"
          >
            + 파일 업로드
          </button>
          <button
            onClick={onUrlAddClick}
            className="px-3 py-1.5 rounded-md border border-edge bg-transparent text-violet-400 cursor-pointer text-[0.8rem]"
          >
            🔗 URL 추가
          </button>
          <button
            onClick={onAiGenerateClick}
            className="px-3 py-1.5 rounded-md border border-violet-500/50 bg-violet-500/10 text-violet-400 cursor-pointer text-[0.8rem]"
          >
            ✨ AI 생성
          </button>
        </div>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {images.length === 0 ? (
          <div
            className="px-10 py-5 border-2 border-dashed border-edge rounded-lg text-content-secondary cursor-pointer"
            onClick={onFileUploadClick}
          >
            클릭하여 이미지 업로드 또는 URL 추가
          </div>
        ) : (
          images.map((img) => (
            <PoolImageItem
              key={img.id}
              image={img}
              onDragStart={onDragStartFromPool}
              onDelete={onDeleteImage}
            />
          ))
        )}
      </div>
    </div>
  );
}
