import { useState } from "react";
import { getApiKey, setApiKey } from "../services/apiKeyManager";

interface KeyGateProps {
  onUnlock: () => void;
}

export function KeyGate({ onUnlock }: KeyGateProps) {
  const [accessKey, setAccessKey] = useState(getApiKey("ncp_access_key"));
  const [secretKey, setSecretKey] = useState(getApiKey("ncp_secret_key"));
  const [geminiKey, setGeminiKey] = useState(getApiKey("gemini_api_key"));
  const [tourKey, setTourKey] = useState(getApiKey("tour_api_key"));
  const [showSecret, setShowSecret] = useState(false);
  const [showOptional, setShowOptional] = useState(
    () => Boolean(getApiKey("gemini_api_key") || getApiKey("tour_api_key")),
  );
  const [error, setError] = useState("");

  const canSubmit = accessKey.trim().length > 0 && secretKey.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError("Access Key와 Secret Key를 모두 입력해주세요.");
      return;
    }

    setApiKey("ncp_access_key", accessKey.trim());
    setApiKey("ncp_secret_key", secretKey.trim());

    if (geminiKey.trim()) {
      setApiKey("gemini_api_key", geminiKey.trim());
    }
    if (tourKey.trim()) {
      setApiKey("tour_api_key", tourKey.trim());
    }

    onUnlock();
  };

  return (
    <div className="min-h-screen bg-surface font-['Pretendard',-apple-system,sans-serif] flex items-center justify-center">
      <div className="w-full max-w-[400px] mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-violet-400 mb-2">
            체험의 발견 JSON 에디터
          </h1>
          <p className="text-sm text-content-secondary">
            시작하려면 NCP Object Storage 키를 입력하세요.
          </p>
        </div>

        <div className="bg-surface-secondary rounded-xl border border-edge p-6 space-y-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs space-y-1">
            <p>NCP 키는 프로젝트 관리자에게 공유받아 입력하세요.</p>
            <p>NCP 키는 새로고침 시 초기화됩니다.</p>
          </div>

          <div>
            <label className="block text-xs text-content-secondary mb-1.5">
              Access Key <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="NCP Access Key"
              className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
            />
          </div>

          <div>
            <label className="block text-xs text-content-secondary mb-1.5">
              Secret Key <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type={showSecret ? "text" : "password"}
                value={secretKey}
                onChange={(e) => {
                  setSecretKey(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="NCP Secret Key"
                className="flex-1 p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
              />
              <button
                onClick={() => setShowSecret((v) => !v)}
                className="px-3 rounded-lg border border-edge bg-transparent text-content-secondary cursor-pointer text-xs shrink-0"
              >
                {showSecret ? "숨김" : "보기"}
              </button>
            </div>
          </div>

          {/* Optional Keys Toggle */}
          <button
            onClick={() => setShowOptional((v) => !v)}
            className="w-full text-left text-xs text-content-secondary hover:text-violet-400 cursor-pointer bg-transparent border-none p-0 flex items-center gap-1.5 transition-colors"
          >
            <span
              className={`inline-block transition-transform ${showOptional ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            추가 API 키 입력 (선택사항)
          </button>

          {showOptional && (
            <div className="space-y-3 pl-1 border-l-2 border-violet-500/30 ml-1">
              <div className="pl-3">
                <label className="block text-xs text-content-secondary mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="AIza... (나중에 설정에서도 입력 가능)"
                  className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
                />
                <p className="text-[10px] text-content-secondary/60 mt-1">
                  AI 이미지 생성 기능에 사용됩니다.
                </p>
              </div>

              <div className="pl-3">
                <label className="block text-xs text-content-secondary mb-1.5">
                  Tour API Service Key
                </label>
                <input
                  type="password"
                  value={tourKey}
                  onChange={(e) => setTourKey(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="공공데이터포털 인증키 (나중에 설정에서도 입력 가능)"
                  className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
                />
                <p className="text-[10px] text-content-secondary/60 mt-1">
                  관광 데이터 검색 기능에 사용됩니다.
                </p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-semibold text-sm cursor-pointer border ${
              canSubmit
                ? "border-violet-500 bg-violet-500 text-white"
                : "border-gray-600 bg-gray-600/20 text-gray-500 cursor-not-allowed"
            }`}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
