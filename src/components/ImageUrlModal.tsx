interface ImageUrlModalProps {
  isOpen: boolean;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onAdd: () => void;
  onAddDirect: () => void;
  onClose: () => void;
}

export function ImageUrlModal({
  isOpen,
  imageUrl,
  onImageUrlChange,
  onAdd,
  onAddDirect,
  onClose,
}: ImageUrlModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[500px] max-h-[80vh] bg-surface-secondary rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 bg-surface border-b border-edge text-violet-400">
          <h3 className="text-sm font-semibold">🔗 이미지 URL 추가</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer text-base"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onAddDirect();
              }
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 text-sm border border-edge rounded-lg bg-input-bg text-content outline-none box-border"
          />
        </div>
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border-none bg-gray-500 text-white font-semibold cursor-pointer text-sm"
          >
            취소
          </button>
          <button
            onClick={onAddDirect}
            className="flex-1 py-3 rounded-lg border border-emerald-500 bg-transparent text-emerald-500 font-semibold cursor-pointer text-sm"
          >
            URL 그대로 사용
          </button>
          <button
            onClick={onAdd}
            className="flex-1 py-3 rounded-lg border border-violet-500 bg-transparent text-violet-400 font-semibold cursor-pointer text-sm"
          >
            편집 후 추가
          </button>
        </div>
      </div>
    </div>
  );
}
