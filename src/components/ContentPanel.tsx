interface ContentPanelProps {
  leftWidth: number;
  title: string;
  description: string;
  note: string;
  status: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

export function ContentPanel({
  leftWidth,
  title,
  description,
  note,
  status,
  onTitleChange,
  onDescriptionChange,
  onNoteChange,
  onStatusChange,
}: ContentPanelProps) {
  return (
    <div
      className="flex flex-col min-w-0"
      style={{ width: `${100 - leftWidth - 1}%` }}
    >
      <div className="flex justify-between items-center px-4 py-2.5 bg-surface-secondary border-b border-edge text-[0.9rem]">
        <span>📝 콘텐츠 정보</span>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="mb-4">
          <label className="block mb-1.5 text-[0.8rem] text-violet-400 font-semibold">
            제목 (TITLE)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="예: 충주 고구려비 전시관"
            className="w-full p-3 bg-surface-card border-none rounded-lg text-content text-lg font-semibold box-border"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-[0.8rem] text-violet-400 font-semibold">
            설명 (DESCRIPTION)
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="장소에 대한 상세 설명을 입력하세요..."
            className="w-full min-h-[150px] p-3 bg-surface-card border-none rounded-lg text-content text-[0.9rem] leading-[1.7] resize-y box-border"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-[0.8rem] text-violet-400 font-semibold">
            노트 (NOTE)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="예: 위 사진은 OOO에서 제공받은 사진입니다."
            className="w-full px-3 py-2.5 bg-input-bg border-none rounded-lg text-content-secondary text-[0.85rem] italic box-border"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-[0.8rem] text-violet-400 font-semibold">
            상태 (STATUS)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "없음" },
              { value: "TEMPORARILY_CLOSED", label: "휴관" },
              { value: "TEMPORARILY_CLOSING", label: "휴관 예정" },
              { value: "PERMANENTLY_CLOSED", label: "폐업" },
              { value: "PERMANENTLY_CLOSING", label: "폐업 예정" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.85rem] cursor-pointer select-none ${
                  status === opt.value
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-input-bg text-content-secondary hover:bg-surface-card"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={status === opt.value}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
