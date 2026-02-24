import type { RowGroup, InfoItem } from "../types";
import useZoomController from "../hooks/useZoomController";

interface PreviewModeProps {
  rowGroups: RowGroup[];
  leftWidth: number;
  title: string;
  description: string;
  note: string;
  infoItems: InfoItem[];
  onClose: () => void;
}

export default function PreviewMode({
  rowGroups,
  leftWidth,
  title,
  description,
  note,
  infoItems,
  onClose,
}: PreviewModeProps) {
  const { scale, containerRef } = useZoomController();

  return (
    <div className="fixed inset-0 z-50 h-screen bg-gray-200 flex items-center justify-center overflow-hidden">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 px-4 py-2 rounded-lg bg-black/60 text-white text-sm cursor-pointer hover:bg-black/80 transition-colors"
      >
        닫기 (ESC)
      </button>

      {/* 줌 컨트롤러 */}
      <div
        ref={containerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
        className="transition-transform duration-200"
      >
        {/* 1920x1200 고정 캔버스 */}
        <div
          className="relative bg-gradient-to-br from-orange-50 via-white to-rose-50 overflow-hidden shadow-2xl flex flex-col"
          style={{ width: "1920px", height: "1200px" }}
        >
          {/* 배경 데코 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-orange-200/20 blur-3xl" />
            <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-rose-200/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-amber-100/10 blur-3xl" />
          </div>

          {/* 헤더 */}
          <header className="relative z-10 px-8 pt-6">
            <div className="flex items-center justify-between py-2 mb-2">
              <div className="p-3">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                체험의{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                  발견
                </span>
              </h1>
              <div className="w-12" />
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="relative z-10 flex-1 px-10 py-8 overflow-y-auto text-black">
            <div className="flex min-h-[800px]">
              {/* 이미지 영역 */}
              <div style={{ width: `${leftWidth}%` }} className="p-4">
                {rowGroups.map((group) => (
                  <div key={group.id} className="flex gap-3 mb-3">
                    {group.columns.map((col) => (
                      <div
                        key={col.id}
                        className="flex flex-col gap-3"
                        style={{ flex: col.widthRatio || 1 }}
                      >
                        {col.items.map((item) => (
                          <div
                            key={item.id}
                            className="relative rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 w-full"
                            style={{
                              aspectRatio: `${item.dimensions.width} / ${item.dimensions.height * (item.flex || 1)}`,
                              flexGrow: 1,
                              minHeight: 0,
                            }}
                          >
                            <img
                              src={item.src}
                              alt={item.caption || ""}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover block"
                            />
                            {item.caption && (
                              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 font-semibold text-white text-2xl text-center bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                                {item.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* 텍스트 영역 */}
              <div
                style={{ width: `${100 - leftWidth}%` }}
                className="p-8 flex flex-col justify-center"
              >
                {title && (
                  <div className="mb-6">
                    <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mb-4" />
                    <h1 className="m-0 text-5xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {title}
                    </h1>
                  </div>
                )}
                {description && (
                  <p className="m-0 mb-6 text-2xl leading-relaxed text-black/60 whitespace-pre-wrap">
                    {description}
                  </p>
                )}
                {note && (
                  <div className="mt-2 pt-5 border-t border-dashed border-black/10">
                    <p className="m-0 text-lg leading-7 text-black/35 italic">
                      {note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* INFO 영역 */}
            {infoItems.length > 0 && (
              <div className="mx-4 mt-4 p-8 rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
                <h3 className="m-0 mb-8 text-3xl font-bold flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white text-lg shadow-md">
                    📋
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    관람 정보
                  </span>
                </h3>
                <div className="flex flex-col gap-5">
                  {infoItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex flex-col gap-1 pb-5 ${idx < infoItems.length - 1 ? "border-b border-black/5" : ""}`}
                    >
                      <div className="flex gap-5 text-2xl">
                        <span className="w-28 shrink-0 text-black/35 font-semibold">
                          {item.title}
                        </span>
                        <span className="text-black/70 font-medium">
                          {item.content}
                        </span>
                      </div>
                      {item.note && (
                        <div className="ml-[132px] text-lg text-black/25 mt-0.5">
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
