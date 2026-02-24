import React, { useRef } from "react";

interface JsonImportModalProps {
  isOpen: boolean;
  importJsonText: string;
  onImportJsonTextChange: (text: string) => void;
  onImport: () => void;
  onJsonFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export function JsonImportModal({
  isOpen,
  importJsonText,
  onImportJsonTextChange,
  onImport,
  onJsonFileSelect,
  onClose,
}: JsonImportModalProps) {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[700px] max-h-[80vh] bg-surface-secondary rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 bg-surface border-b border-edge text-violet-400">
          <h3>📥 JSON 불러오기</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer text-base"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <div className="mb-3">
            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={onJsonFileSelect}
              className="hidden"
            />
            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="w-full px-5 py-2.5 rounded-lg border border-indigo-500 bg-indigo-500/10 text-indigo-500 font-semibold cursor-pointer"
            >
              📁 JSON 파일 선택
            </button>
          </div>
          <div className="mb-2 text-[0.8rem] text-content-secondary">
            또는 아래에 JSON을 직접 붙여넣기:
          </div>
          <textarea
            value={importJsonText}
            onChange={(e) => onImportJsonTextChange(e.target.value)}
            placeholder='{"TITLE": "...", "INNER_IMAGES": [...] }'
            className="w-full min-h-[200px] p-3 bg-surface border border-edge rounded-lg text-emerald-500 text-[0.75rem] font-mono resize-y box-border"
          />
        </div>
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border-none bg-gray-500 text-white font-semibold cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onImport}
            disabled={!importJsonText.trim()}
            className={`flex-1 py-3 rounded-lg border border-emerald-500 bg-transparent text-emerald-500 font-semibold ${
              importJsonText.trim()
                ? "cursor-pointer opacity-100"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            불러오기
          </button>
        </div>
      </div>
    </div>
  );
}
