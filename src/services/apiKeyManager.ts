const STORAGE_PREFIX = "poco_key_";

export type StorageType = "local" | "session";

export interface ApiKeyConfig {
  key: string;
  label: string;
  envVar: string;
  placeholder: string;
  group: string;
  storage: StorageType;
}

export const API_KEY_CONFIGS: ApiKeyConfig[] = [
  {
    key: "gemini_api_key",
    label: "API Key",
    envVar: "VITE_GEMINI_API_KEY",
    placeholder: "AIza...",
    group: "Gemini",
    storage: "local",
  },
  {
    key: "tour_api_key",
    label: "Service Key",
    envVar: "VITE_TOUR_API_KEY",
    placeholder: "공공데이터포털 인증키",
    group: "Tour API",
    storage: "local",
  },
  {
    key: "ncp_access_key",
    label: "Access Key",
    envVar: "VITE_NCP_ACCESS_KEY",
    placeholder: "NCP Access Key",
    group: "NCP Object Storage",
    storage: "session",
  },
  {
    key: "ncp_secret_key",
    label: "Secret Key",
    envVar: "VITE_NCP_SECRET_KEY",
    placeholder: "NCP Secret Key",
    group: "NCP Object Storage",
    storage: "session",
  },
];

export interface ApiKeyGroupInfo {
  description: string;
  url: string;
  urlLabel: string;
  steps: string[];
}

export const API_KEY_GROUP_INFO: Record<string, ApiKeyGroupInfo> = {
  Gemini: {
    description: "Google AI Studio에서 무료로 API 키를 발급받을 수 있습니다.",
    url: "https://aistudio.google.com/apikey",
    urlLabel: "Google AI Studio",
    steps: [
      "Google 계정으로 AI Studio 로그인",
      "좌측 메뉴 'API keys' 클릭",
      "'Create API key' 버튼으로 키 생성",
    ],
  },
  "Tour API": {
    description:
      "공공데이터포털에서 TourAPI 활용 신청 후 인증키를 발급받습니다.",
    url: "https://www.data.go.kr",
    urlLabel: "공공데이터포털",
    steps: [
      "공공데이터포털 회원가입 및 로그인",
      "'한국관광공사_국문 관광정보 서비스_GW' 검색",
      "활용 신청 후 마이페이지에서 인증키 확인",
    ],
  },
  "NCP Object Storage": {
    description:
      "NCP Object Storage 키는 프로젝트 관리자에게 공유받아 입력하세요.",
    url: "",
    urlLabel: "",
    steps: [
      "프로젝트 관리자에게 Access Key / Secret Key 요청",
      "전달받은 키를 아래에 입력",
    ],
  },
};

function getEnvValue(envVar: string): string {
  return (import.meta.env[envVar] as string) || "";
}

function getStorage(key: string): Storage {
  const config = API_KEY_CONFIGS.find((c) => c.key === key);
  return config?.storage === "local" ? localStorage : sessionStorage;
}

export function getApiKey(key: string): string {
  const storage = getStorage(key);
  const storedValue = storage.getItem(`${STORAGE_PREFIX}${key}`);
  if (storedValue !== null) return storedValue;

  const config = API_KEY_CONFIGS.find((c) => c.key === key);
  if (config) return getEnvValue(config.envVar);

  return "";
}

export function setApiKey(key: string, value: string): void {
  const storage = getStorage(key);
  storage.setItem(`${STORAGE_PREFIX}${key}`, value);
}

export function getAllKeys(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const config of API_KEY_CONFIGS) {
    result[config.key] = getApiKey(config.key);
  }
  return result;
}

export function setAllKeys(keys: Record<string, string>): void {
  for (const [key, value] of Object.entries(keys)) {
    setApiKey(key, value);
  }
}

export function clearAllKeys(): void {
  for (const config of API_KEY_CONFIGS) {
    const storage = config.storage === "local" ? localStorage : sessionStorage;
    storage.removeItem(`${STORAGE_PREFIX}${config.key}`);
  }
}

export function getGroupedConfigs(): Record<string, ApiKeyConfig[]> {
  const grouped: Record<string, ApiKeyConfig[]> = {};
  for (const config of API_KEY_CONFIGS) {
    if (!grouped[config.group]) {
      grouped[config.group] = [];
    }
    grouped[config.group].push(config);
  }
  return grouped;
}
