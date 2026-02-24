import type { ImageDimensions } from "../types";

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const validateImageSrc = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

export const getImageDimensions = (src: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        ratio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => {
      reject(new Error("이미지를 불러올 수 없습니다."));
    };
    img.src = src;
  });
};
