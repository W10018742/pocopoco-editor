import { useEffect, useRef, useState } from "react";
import { getApiKey } from "../services/apiKeyManager";
import {
  fetchGeminiModels,
  generateImageWithGemini,
  type GeminiModel,
} from "../services/geminiApi";

interface UploadedImage {
  id: string;
  src: string;
}

interface ImageGenerateModalProps {
  isOpen: boolean;
  onAddToPool: (imageDataUrl: string) => void;
  onClose: () => void;
  onOpenSettings: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageGenerateModal({
  isOpen,
  onAddToPool,
  onClose,
  onOpenSettings,
}: ImageGenerateModalProps) {
  const [prompt, setPrompt] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [models, setModels] = useState<GeminiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasApiKey = Boolean(getApiKey("gemini_api_key"));

  useEffect(() => {
    if (!isOpen) return;

    const key = getApiKey("gemini_api_key");
    if (!key) {
      setModels([]);
      setSelectedModel("");
      return;
    }

    setIsLoadingModels(true);
    setError(null);

    fetchGeminiModels()
      .then((result) => {
        setModels(result);
        if (result.length > 0 && !selectedModel) {
          setSelectedModel(result[0].id);
        }
      })
      .catch((err) => {
        setModels([]);
        setError(
          err instanceof Error
            ? err.message
            : "모델 목록을 불러올 수 없습니다.",
        );
      })
      .finally(() => setIsLoadingModels(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const addFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length === 0) return;

    const newImages: UploadedImage[] = [];
    for (const file of imageFiles) {
      const src = await readFileAsDataUrl(file);
      newImages.push({
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        src,
      });
    }
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해주세요.");
      return;
    }
    if (!selectedModel) {
      setError("모델을 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const refSources = uploadedImages.map((img) => img.src);

      const result = await generateImageWithGemini(
        prompt,
        selectedModel,
        refSources,
      );
      setGeneratedImage(result.imageDataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "이미지 생성에 실패했습니다.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToPool = () => {
    if (generatedImage) {
      onAddToPool(generatedImage);
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setPrompt("");
    setUploadedImages([]);
    setGeneratedImage(null);
    setError(null);
    setIsGenerating(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={handleClose}
    >
      <div
        className="w-[90%] max-w-[600px] max-h-[85vh] bg-surface-secondary rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-surface border-b border-edge text-violet-400">
          <h3 className="text-sm font-semibold">✨ AI 이미지 생성</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!hasApiKey && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between">
              <span>Gemini API 키가 설정되지 않았습니다.</span>
              <button
                onClick={onOpenSettings}
                className="px-3 py-1 rounded-md border border-amber-500/50 bg-transparent text-amber-400 cursor-pointer text-xs shrink-0"
              >
                설정 열기
              </button>
            </div>
          )}

          {/* Model Selector */}
          {hasApiKey && (
            <div>
              <label className="block text-xs text-content-secondary mb-2">
                모델 선택
              </label>
              {isLoadingModels ? (
                <div className="flex items-center gap-2 text-xs text-content-secondary py-2">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  모델 목록 로딩 중...
                </div>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
                >
                  {models.length === 0 && <option value="">모델 없음</option>}
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName} ({m.id})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Reference Image Upload */}
          {models.length > 0 && (
            <div>
              <label className="block text-xs text-content-secondary mb-2">
                참조 이미지 (선택사항)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-[56px] h-[56px] rounded-md overflow-hidden shrink-0 border border-edge"
                    >
                      <img
                        src={img.src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-bl-md border-none text-white text-[10px] leading-none cursor-pointer flex items-center justify-center p-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer text-xs transition-colors ${
                  isDragging
                    ? "border-violet-500 bg-violet-500/10 text-violet-400"
                    : "border-edge text-content-secondary hover:border-violet-500/50"
                }`}
              >
                <span>+ 이미지 추가 (클릭 또는 드래그)</span>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          {models.length > 0 && (
            <div>
              <label className="block text-xs text-content-secondary mb-2">
                프롬프트
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="생성하고 싶은 이미지를 설명해주세요..."
                rows={3}
                className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border resize-none"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Loading */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-content-secondary">이미지 생성 중...</p>
            </div>
          )}

          {/* Generated Result */}
          {generatedImage && !isGenerating && (
            <div>
              <label className="block text-xs text-content-secondary mb-2">
                생성 결과
              </label>
              <div className="rounded-lg overflow-hidden border border-edge">
                <img
                  src={generatedImage}
                  alt="생성된 이미지"
                  className="w-full h-auto max-h-[300px] object-contain bg-black/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-lg border-none bg-gray-500 text-white font-semibold cursor-pointer text-sm"
          >
            닫기
          </button>
          {generatedImage && !isGenerating ? (
            <button
              onClick={handleAddToPool}
              className="flex-1 py-3 rounded-lg border border-emerald-500 bg-transparent text-emerald-500 font-semibold cursor-pointer text-sm"
            >
              이미지 풀에 추가
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || models.length === 0 || !selectedModel}
              className={`flex-1 py-3 rounded-lg border font-semibold cursor-pointer text-sm ${
                isGenerating || models.length === 0 || !selectedModel
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : "border-violet-500 bg-transparent text-violet-400"
              }`}
            >
              {isGenerating ? "생성 중..." : "이미지 생성"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
