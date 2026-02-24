interface EditorHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenSearchPanel: () => void;
  onOpenSettings: () => void;
  onLoadSample: () => void;
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onTogglePreview: () => void;
}

export function EditorHeader({
  theme,
  onToggleTheme,
  onOpenSearchPanel,
  onOpenSettings,
  onLoadSample,
  onOpenImportModal,
  onOpenExportModal,
  onTogglePreview,
}: EditorHeaderProps) {
  return (
    <header className="flex justify-between items-center px-5 py-3 bg-surface-secondary border-b border-edge">
      <h1 className="m-0 text-[1.3rem] font-bold text-violet-400">
        체험의 발견 JSON 에디터
      </h1>
      <div className="flex gap-2.5">
        <button
          onClick={onOpenSettings}
          className="px-3 py-2 rounded-md border border-edge bg-transparent text-content-secondary font-semibold cursor-pointer text-lg"
          title="설정"
        >
          ⚙️
        </button>
        <button
          onClick={onToggleTheme}
          className="px-3 py-2 rounded-md border border-edge bg-transparent text-content-secondary font-semibold cursor-pointer text-lg"
          title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
          {theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19"}
        </button>
        <button
          onClick={onOpenSearchPanel}
          className="px-4 py-2 rounded-md border border-emerald-500 bg-transparent text-emerald-500 font-semibold cursor-pointer"
        >
          🔍 Tour API 검색
        </button>
        <button
          onClick={onLoadSample}
          className="px-4 py-2 rounded-md border border-violet-500 bg-transparent text-violet-500 font-semibold cursor-pointer"
        >
          🧪 샘플 불러오기
        </button>
        <button
          onClick={onOpenImportModal}
          className="px-4 py-2 rounded-md border border-amber-500 bg-transparent text-amber-500 font-semibold cursor-pointer"
        >
          📥 JSON 불러오기
        </button>
        <button
          onClick={onOpenExportModal}
          className="px-4 py-2 rounded-md border border-emerald-500 bg-transparent text-emerald-500 font-semibold cursor-pointer"
        >
          📤 JSON 내보내기
        </button>
        <button
          onClick={onTogglePreview}
          className="px-4 py-2 rounded-md border-none bg-indigo-500 text-white font-semibold cursor-pointer"
        >
          👁️ 미리보기
        </button>
      </div>
    </header>
  );
}
