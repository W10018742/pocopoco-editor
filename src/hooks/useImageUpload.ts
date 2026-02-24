import type { SetStateAction } from "react";
import type { EditResult, PoolImage } from "../types";
import { generateId, getImageDimensions } from "../utils";
import {
  isStorageConfigured,
  uploadImageToStorage,
} from "../services/objectStorage";

interface UseImageUploadParams {
  setImages: (value: SetStateAction<PoolImage[]>) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  setEditingImage: (v: string | null) => void;
  setShowImageEditor: (v: boolean) => void;
  setShowUrlModal: (v: boolean) => void;
}

export function useImageUpload({
  setImages,
  imageUrl,
  setImageUrl,
  setEditingImage,
  setShowImageEditor,
  setShowUrlModal,
}: UseImageUploadParams) {
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const src = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });

    setEditingImage(src);
    setShowImageEditor(true);
    e.target.value = "";
  };

  const handleAddImageByUrl = async () => {
    if (!imageUrl.trim()) {
      alert("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      await getImageDimensions(imageUrl);
      setEditingImage(imageUrl);
      setShowImageEditor(true);
      setImageUrl("");
      setShowUrlModal(false);
    } catch {
      alert("이미지를 불러올 수 없습니다. URL을 확인해주세요.");
    }
  };

  const handleAddImageByUrlDirect = async () => {
    if (!imageUrl.trim()) {
      alert("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      const dimensions = await getImageDimensions(imageUrl);
      const imageId = generateId();

      const newImage: PoolImage = {
        id: imageId,
        src: imageUrl.trim(),
        dimensions,
        caption: "",
      };

      setImages((prev) => [...prev, newImage]);
      setImageUrl("");
      setShowUrlModal(false);
    } catch {
      alert("이미지를 불러올 수 없습니다. URL을 확인해주세요.");
    }
  };

  const handleImageEditComplete = async (result: EditResult) => {
    const { url, blob, fileName } = result;
    const dimensions = await getImageDimensions(url);
    const imageId = generateId();

    const shouldUpload = isStorageConfigured();

    const newImage: PoolImage = {
      id: imageId,
      src: url,
      dimensions,
      caption: "",
      uploadStatus: shouldUpload ? "uploading" : undefined,
    };

    setImages((prev) => [...prev, newImage]);
    setShowImageEditor(false);
    setEditingImage(null);

    if (shouldUpload) {
      try {
        const { cdnUrl } = await uploadImageToStorage(blob, fileName);
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, src: cdnUrl, uploadStatus: "success" }
              : img,
          ),
        );
      } catch (error) {
        console.error("CDN 업로드 실패:", error);
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, uploadStatus: "error" } : img,
          ),
        );
      }
    }
  };

  const handleImageEditCancel = () => {
    setShowImageEditor(false);
    setEditingImage(null);
  };

  return {
    handleFileSelect,
    handleAddImageByUrl,
    handleAddImageByUrlDirect,
    handleImageEditComplete,
    handleImageEditCancel,
  };
}
