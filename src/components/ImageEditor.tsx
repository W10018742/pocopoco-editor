import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import type { EditResult } from "../types";

interface ImageEditorProps {
  imageSrc: string;
  onSave: (result: EditResult) => void;
  onCancel: () => void;
}

interface Dimensions {
  width: number;
  height: number;
}

const aspectBtnBase =
  "px-3 py-1.5 border-none rounded-md text-[0.8rem] cursor-pointer transition-all";

const aspectBtnClass = `${aspectBtnBase} bg-surface-card text-content-secondary`;
const aspectBtnActiveClass = `${aspectBtnBase} bg-indigo-500 text-white font-semibold`;

/**
 * ImageEditor - 이미지 편집 컴포넌트
 *
 * 기능:
 * - 크롭
 * - 줌 (확대/축소)
 * - 회전
 * - 비율 유지 옵션
 */
export default function ImageEditor({
  imageSrc,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspect, setAspect] = useState(4 / 3);
  const [lockAspect, setLockAspect] = useState(true);
  const [maxResolution, setMaxResolution] = useState(1920); // 최대 해상도
  const [fileName, setFileName] = useState(
    () => localStorage.getItem("poco_last_filename") || "",
  );
  const [originalDimensions, setOriginalDimensions] =
    useState<Dimensions | null>(null);

  // 원본 이미지 크기 로드
  useEffect(() => {
    createImage(imageSrc).then((img) => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    });
  }, [imageSrc]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  // Canvas로 편집된 이미지 생성
  const createEditedImage = async (): Promise<EditResult | null> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx || !croppedAreaPixels) return null;

      const maxSize = Math.max(image.width, image.height);
      const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

      canvas.width = safeArea;
      canvas.height = safeArea;

      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5,
      );

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      // 크롭된 크기로 설정
      let finalWidth = croppedAreaPixels.width;
      let finalHeight = croppedAreaPixels.height;

      // 해상도 제한 적용
      if (maxResolution > 0) {
        const maxDimension = Math.max(finalWidth, finalHeight);
        if (maxDimension > maxResolution) {
          const scale = maxResolution / maxDimension;
          finalWidth = Math.round(finalWidth * scale);
          finalHeight = Math.round(finalHeight * scale);
        }
      }

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - croppedAreaPixels.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - croppedAreaPixels.y),
      );

      // 최종 해상도로 리사이즈
      if (
        finalWidth !== croppedAreaPixels.width ||
        finalHeight !== croppedAreaPixels.height
      ) {
        const resizeCanvas = document.createElement("canvas");
        const resizeCtx = resizeCanvas.getContext("2d");
        if (!resizeCtx) return null;
        resizeCanvas.width = finalWidth;
        resizeCanvas.height = finalHeight;
        resizeCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);

        const trimmedName = fileName.trim() || undefined;
        return new Promise<EditResult>((resolve) => {
          resizeCanvas.toBlob(
            (blob) => {
              if (!blob) return;
              resolve({
                blob,
                url: URL.createObjectURL(blob),
                width: finalWidth,
                height: finalHeight,
                fileName: trimmedName,
              });
            },
            "image/jpeg",
            0.92,
          );
        });
      }

      const trimmedName = fileName.trim() || undefined;
      return new Promise<EditResult>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              width: finalWidth,
              height: finalHeight,
              fileName: trimmedName,
            });
          },
          "image/jpeg",
          0.92,
        );
      });
    } catch (error) {
      console.error("이미지 편집 실패:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!fileName.trim()) return;
    const result = await createEditedImage();
    if (result) {
      localStorage.setItem("poco_last_filename", fileName.trim());
      onSave(result);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setMaxResolution(1920);
    setLockAspect(true);
    setAspect(4 / 3);
    setFileName("");
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999]">
      <div className="bg-surface-secondary rounded-2xl w-[90vw] max-w-[1000px] h-[90vh] max-h-[800px] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-edge flex justify-between items-center">
          <div>
            <h2 className="m-0 text-[1.4rem] font-bold text-content">
              🎨 이미지 편집
            </h2>
            {originalDimensions && (
              <div className="mt-1 text-[0.85rem] text-content-secondary">
                원본: {originalDimensions.width}x{originalDimensions.height}px
              </div>
            )}
          </div>
          <button
            onClick={onCancel}
            className="bg-transparent border-none text-gray-400 text-2xl cursor-pointer px-2 py-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 크롭 영역 */}
        <div className="relative flex-1 bg-black min-h-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={lockAspect ? aspect : undefined}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* 컨트롤 영역 */}
        <div className="px-6 py-3 bg-surface border-t border-edge grid grid-cols-2 gap-x-6 gap-y-3">
          {/* 줌 조절 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-content text-[0.85rem] font-medium">
              🔍 확대/축소: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1.5 rounded-sm bg-edge outline-none cursor-pointer"
            />
          </div>

          {/* 회전 조절 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-content text-[0.85rem] font-medium">
              🔄 회전: {rotation}°
            </label>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-1.5 rounded-sm bg-edge outline-none cursor-pointer"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="px-3 py-1.5 bg-surface-card border-none rounded-md text-content-secondary text-[0.8rem] cursor-pointer transition-colors"
              >
                ↶ -90°
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-3 py-1.5 bg-surface-card border-none rounded-md text-content-secondary text-[0.8rem] cursor-pointer transition-colors"
              >
                ↷ +90°
              </button>
            </div>
          </div>

          {/* 비율 설정 */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-content text-[0.85rem] cursor-pointer">
              <input
                type="checkbox"
                checked={lockAspect}
                onChange={(e) => setLockAspect(e.target.checked)}
                className="cursor-pointer"
              />
              비율 고정
            </label>
            {lockAspect && (
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setAspect(4 / 3)}
                  className={
                    aspect === 4 / 3 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  4:3
                </button>
                <button
                  onClick={() => setAspect(16 / 9)}
                  className={
                    aspect === 16 / 9 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  16:9
                </button>
                <button
                  onClick={() => setAspect(1)}
                  className={
                    aspect === 1 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  1:1
                </button>
                <button
                  onClick={() => setAspect(3 / 4)}
                  className={
                    aspect === 3 / 4 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  3:4
                </button>
                <button
                  onClick={() => setAspect(2 / 3)}
                  className={
                    aspect === 2 / 3 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  2:3
                </button>
                <button
                  onClick={() => setAspect(9 / 16)}
                  className={
                    aspect === 9 / 16 ? aspectBtnActiveClass : aspectBtnClass
                  }
                >
                  9:16
                </button>
              </div>
            )}
          </div>

          {/* 해상도 설정 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-content text-[0.85rem] font-medium">
              📐 최대 해상도 (긴 쪽 기준)
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setMaxResolution(0)}
                className={
                  maxResolution === 0 ? aspectBtnActiveClass : aspectBtnClass
                }
              >
                원본
              </button>
              <button
                onClick={() => setMaxResolution(1920)}
                className={
                  maxResolution === 1920 ? aspectBtnActiveClass : aspectBtnClass
                }
              >
                1920px
              </button>
              <button
                onClick={() => setMaxResolution(1280)}
                className={
                  maxResolution === 1280 ? aspectBtnActiveClass : aspectBtnClass
                }
              >
                1280px
              </button>
              <button
                onClick={() => setMaxResolution(800)}
                className={
                  maxResolution === 800 ? aspectBtnActiveClass : aspectBtnClass
                }
              >
                800px
              </button>
            </div>
            <div className="px-3 py-1.5 bg-indigo-500/10 rounded-md text-content-secondary text-[0.75rem] leading-relaxed">
              {maxResolution === 0
                ? "💡 원본 크기로 저장됩니다"
                : `💡 긴 쪽이 ${maxResolution}px을 초과하면 비율 유지하며 축소됩니다`}
            </div>
          </div>

          {/* 파일명 입력 */}
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-content text-[0.85rem] font-medium">
              파일명 <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="업로드할 이미지 이름을 입력하세요"
                className={`flex-1 px-3 py-2 text-sm border rounded-lg bg-input-bg text-content outline-none box-border ${
                  fileName.trim() ? "border-edge" : "border-red-500/50"
                }`}
              />
              <span className="text-content-secondary text-sm shrink-0">.jpg</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="px-6 py-3 border-t border-edge flex justify-between items-center">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-gray-500 border-none rounded-lg text-white text-[0.9rem] cursor-pointer font-semibold transition-colors"
          >
            🔄 초기화
          </button>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-500 border-none rounded-lg text-white text-[0.9rem] cursor-pointer font-semibold transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!fileName.trim()}
              className={`px-8 py-2.5 border-none rounded-lg text-[0.9rem] font-bold transition-colors ${
                fileName.trim()
                  ? "bg-emerald-500 text-white cursor-pointer"
                  : "bg-gray-600/30 text-gray-500 cursor-not-allowed"
              }`}
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image 로드 헬퍼
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
