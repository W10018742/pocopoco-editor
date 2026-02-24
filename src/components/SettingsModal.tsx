import { useState } from "react";
import {
  getAllKeys,
  setAllKeys,
  clearAllKeys,
  getGroupedConfigs,
  API_KEY_GROUP_INFO,
} from "../services/apiKeyManager";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SENSITIVE_KEYS = new Set([
  "gemini_api_key",
  "tour_api_key",
  "ncp_access_key",
  "ncp_secret_key",
]);

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<Record<string, string>>(getAllKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const grouped = getGroupedConfigs();

  const handleChange = (key: string, value: string) => {
    setKeys((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = () => {
    setAllKeys(keys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearAllKeys();
    setKeys(getAllKeys());
    setSaved(false);
  };

  const handleClose = () => {
    setSaved(false);
    setVisibleKeys(new Set());
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
          <h3 className="text-sm font-semibold">설정</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs space-y-1">
            <p>
              <span className="font-semibold">Gemini / Tour API</span> —
              브라우저에 저장되어 유지됩니다.
            </p>
            <p>
              <span className="font-semibold">NCP</span> — 새로고침 시 초기화됩니다.
            </p>
          </div>

          {Object.entries(grouped).map(([group, configs]) => {
            const info = API_KEY_GROUP_INFO[group];
            return (
            <div key={group}>
              <h4 className="text-xs font-semibold text-content-secondary mb-2 uppercase tracking-wider">
                {group}
              </h4>
              {info && (
                <div className="mb-3 p-3 rounded-lg bg-surface-card border border-edge text-xs text-content-secondary space-y-1.5">
                  <p>{info.description}</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-content-secondary/80">
                    {info.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {info.url && (
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-violet-400 underline underline-offset-2"
                    >
                      {info.urlLabel} &rarr;
                    </a>
                  )}
                </div>
              )}
              <div className="space-y-2">
                {configs.map((config) => {
                  const isSensitive = SENSITIVE_KEYS.has(config.key);
                  const isVisible = visibleKeys.has(config.key);
                  return (
                    <div key={config.key}>
                      <label className="block text-xs text-content-secondary mb-1">
                        {config.label}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={isSensitive && !isVisible ? "password" : "text"}
                          value={keys[config.key] || ""}
                          onChange={(e) =>
                            handleChange(config.key, e.target.value)
                          }
                          placeholder={config.placeholder}
                          className="flex-1 p-2.5 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
                        />
                        {isSensitive && (
                          <button
                            onClick={() => toggleVisibility(config.key)}
                            className="px-3 rounded-lg border border-edge bg-transparent text-content-secondary cursor-pointer text-xs shrink-0"
                          >
                            {isVisible ? "숨김" : "보기"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={handleClear}
            className="px-4 py-3 rounded-lg border border-red-500/50 bg-transparent text-red-400 font-semibold cursor-pointer text-sm"
          >
            초기화
          </button>
          <div className="flex-1" />
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg border-none bg-gray-500 text-white font-semibold cursor-pointer text-sm"
          >
            닫기
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-3 rounded-lg border font-semibold cursor-pointer text-sm ${
              saved
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-violet-500 bg-transparent text-violet-400"
            }`}
          >
            {saved ? "저장됨" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
