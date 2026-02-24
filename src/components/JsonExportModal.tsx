interface JsonExportModalProps {
  isOpen: boolean;
  exportData: object;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export function JsonExportModal({
  isOpen,
  exportData,
  onCopy,
  onDownload,
  onClose,
}: JsonExportModalProps) {
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
          <h3>📤 JSON 내보내기</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer text-base"
          >
            ✕
          </button>
        </div>
        <pre className="flex-1 m-0 p-4 bg-surface text-emerald-500 text-[0.75rem] font-mono overflow-auto whitespace-pre-wrap">
          {JSON.stringify(exportData, null, 2)}
        </pre>
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={onCopy}
            className="flex-1 py-3 rounded-lg border-none bg-indigo-500 text-white font-semibold cursor-pointer"
          >
            📋 클립보드 복사
          </button>
          <button
            onClick={onDownload}
            className="flex-1 py-3 rounded-lg border border-emerald-500 bg-transparent text-emerald-500 font-semibold cursor-pointer"
          >
            ⬇️ 파일 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
