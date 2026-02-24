import type { InfoItem } from "../types";

interface InfoItemsSectionProps {
  infoItems: InfoItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof InfoItem, value: string) => void;
  onDelete: (id: string) => void;
  onMove: (index: number, direction: number) => void;
}

export function InfoItemsSection({
  infoItems,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
}: InfoItemsSectionProps) {
  return (
    <div className="bg-surface border-t border-edge px-5 py-3.5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[0.95rem] font-semibold text-amber-500">
          📋 관람 정보
        </span>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 rounded-md border border-amber-500 bg-transparent text-amber-500 cursor-pointer text-[0.75rem]"
        >
          + 항목
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {infoItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-surface-secondary rounded-md p-2.5 border-l-[3px] border-amber-500"
          >
            <div className="flex justify-end mb-1.5">
              <div className="flex gap-1">
                <button
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="w-[22px] h-[22px] rounded border border-edge bg-surface-card text-content-secondary cursor-pointer text-[0.65rem]"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMove(index, 1)}
                  disabled={index === infoItems.length - 1}
                  className="w-[22px] h-[22px] rounded border border-edge bg-surface-card text-content-secondary cursor-pointer text-[0.65rem]"
                >
                  ↓
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="w-[22px] h-[22px] rounded border border-edge bg-surface-card text-red-500 cursor-pointer text-[0.65rem]"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex gap-2.5 mb-1.5">
              <input
                type="text"
                value={item.title}
                onChange={(e) => onUpdate(item.id, "title", e.target.value)}
                placeholder="항목명"
                className="w-[120px] p-2 bg-surface-card border-none rounded text-amber-500 text-[0.85rem] font-semibold"
              />
              <input
                type="text"
                value={item.content}
                onChange={(e) => onUpdate(item.id, "content", e.target.value)}
                placeholder="내용"
                className="flex-1 p-2 bg-surface-card border-none rounded text-content text-[0.85rem]"
              />
            </div>
            <input
              type="text"
              value={item.note || ""}
              onChange={(e) => onUpdate(item.id, "note", e.target.value)}
              placeholder="노트 (선택)"
              className="w-full px-2 py-1.5 bg-input-bg border-none rounded text-content-secondary text-[0.75rem] italic box-border"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
