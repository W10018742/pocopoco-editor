import { getApiKey } from "./apiKeyManager";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

function getGeminiKey(): string {
  return getApiKey("gemini_api_key");
}

export interface GeminiModel {
  id: string;
  displayName: string;
}

export async function fetchGeminiModels(): Promise<GeminiModel[]> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 설정에서 입력해주세요.");
  }

  const response = await fetch(`${BASE_URL}/models?key=${apiKey}`);

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      throw new Error("API 키가 유효하지 않습니다.");
    }
    throw new Error(`모델 목록 조회 실패: ${response.status}`);
  }

  const data = await response.json();
  const models = data.models || [];

  return models
    .filter(
      (m: { name: string; supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        /[-/]image/.test(m.name),
    )
    .map((m: { name: string; displayName: string }) => ({
      id: m.name.replace("models/", ""),
      displayName: m.displayName,
    }));
}

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GenerateImageResult {
  imageDataUrl: string;
  mimeType: string;
}

export async function generateImageWithGemini(
  prompt: string,
  model: string,
  referenceImages: string[] = [],
): Promise<GenerateImageResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 설정에서 입력해주세요.");
  }

  const parts: GeminiPart[] = [];

  for (const imgSrc of referenceImages) {
    const { mimeType, data } = await imageSourceToBase64(imgSrc);
    parts.push({ inlineData: { mimeType, data } });
  }

  parts.push({ text: prompt });

  const response = await fetch(
    `${BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message || `API 요청 실패: ${response.status}`,
    );
  }

  const data = await response.json();

  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const content = candidate.content;
    if (!content?.parts) continue;

    for (const part of content.parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        return {
          imageDataUrl: `data:${mimeType};base64,${part.inlineData.data}`,
          mimeType,
        };
      }
    }
  }

  throw new Error("이미지 생성에 실패했습니다. 다른 프롬프트를 시도해주세요.");
}

async function imageSourceToBase64(
  src: string,
): Promise<{ mimeType: string; data: string }> {
  if (src.startsWith("data:")) {
    const match = src.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      return { mimeType: match[1], data: match[2] };
    }
  }

  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const mimeType = blob.type || "image/jpeg";

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1];
        resolve({ mimeType, data: base64Data });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return imageToBase64ViaCanvas(src);
  }
}

function imageToBase64ViaCanvas(
  src: string,
): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas를 생성할 수 없습니다."));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const base64Data = dataUrl.split(",")[1];
        resolve({ mimeType: "image/jpeg", data: base64Data });
      } catch {
        reject(
          new Error(
            "외부 URL 이미지는 참조할 수 없습니다. 파일로 업로드된 이미지를 사용해주세요.",
          ),
        );
      }
    };
    img.onerror = () => {
      reject(
        new Error(
          "외부 URL 이미지를 불러올 수 없습니다. 파일로 업로드된 이미지를 사용해주세요.",
        ),
      );
    };
    img.src = src;
  });
}
