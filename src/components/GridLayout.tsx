import React, { useState } from "react";
import type { RowGroup, GridItem, DropTarget, SelectedItem } from "../types";

interface GridLayoutProps {
  rowGroups: RowGroup[];
  leftWidth: number;
  dropTarget: DropTarget | null;
  selectedItem: SelectedItem | null;
  onDragStartFromGrid: (
    e: React.DragEvent,
    image: GridItem,
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
  ) => void;
  onDragOver: (
    e: React.DragEvent,
    groupIndex: number,
    colIndex: number,
    position: string,
    itemIndex?: number | null,
  ) => void;
  onDragLeave: () => void;
  onDrop: (
    e: React.DragEvent,
    groupIndex: number,
    colIndex: number,
    position: string,
    itemIndex?: number | null,
  ) => void;
  onDropOnEmpty: (e: React.DragEvent) => void;
  onSelectItem: (item: SelectedItem) => void;
  onDeleteItem: (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
  ) => void;
  onUpdateCaption: (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
    caption: string,
  ) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

function GridImage({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="w-full h-full min-h-[60px] flex flex-col items-center justify-center gap-1 bg-red-500/10 text-red-400">
        <span className="text-2xl">⚠️</span>
        <span className="text-[0.7rem]">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="w-full h-full object-cover block"
      onError={() => setBroken(true)}
    />
  );
}

export function GridLayout({
  rowGroups,
  leftWidth,
  dropTarget,
  selectedItem,
  onDragStartFromGrid,
  onDragOver,
  onDragLeave,
  onDrop,
  onDropOnEmpty,
  onSelectItem,
  onDeleteItem,
  onUpdateCaption,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: GridLayoutProps) {
  return (
    <div
      className="flex flex-col min-w-0"
      style={{ width: `${leftWidth}%` }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropOnEmpty}
    >
      <div className="flex justify-between items-center px-4 py-2.5 bg-surface-secondary border-b border-edge text-[0.9rem]">
        <span>🖼️ 이미지 레이아웃</span>
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-content-secondary">
            선택 후 가로/세로 비율 조절
          </span>
          <button
            onClick={onUndo}
            disabled={!canUndo()}
            className="px-1.5 py-0.5 rounded border border-edge bg-transparent text-content-secondary cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title="실행 취소 (Ctrl+Z)"
          >
            ↩
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo()}
            className="px-1.5 py-0.5 rounded border border-edge bg-transparent text-content-secondary cursor-pointer text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            title="다시 실행 (Ctrl+Shift+Z)"
          >
            ↪
          </button>
        </div>
      </div>

      <div className="flex-1 w-full p-4 overflow-auto box-border">
        {rowGroups.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px] border-2 border-dashed border-edge rounded-xl text-content-secondary relative"
            onDragOver={(e) => {
              e.preventDefault();
              onDragOver(e, 0, 0, "new-group");
            }}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 0, 0, "new-group")}
          >
            <span className="text-5xl opacity-50">📷</span>
            <span>이미지를 여기에 드롭하세요</span>
            {dropTarget?.position === "new-group" && (
              <div className="absolute inset-2 border-[3px] border-dashed border-indigo-500 rounded-lg pointer-events-none" />
            )}
          </div>
        ) : (
          rowGroups.map((group, groupIndex) => (
            <div key={group.id} className="mb-2 w-full">
              {groupIndex === 0 && (
                <div
                  className="h-5 mb-1 relative"
                  onDragOver={(e) =>
                    onDragOver(e, groupIndex, 0, "new-group-above")
                  }
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, groupIndex, 0, "new-group-above")}
                >
                  {dropTarget?.groupIndex === groupIndex &&
                    dropTarget?.position === "new-group-above" && (
                      <div className="absolute left-[2%] top-1/2 w-[96%] h-1 bg-indigo-500 rounded-sm -translate-y-1/2" />
                    )}
                </div>
              )}
              <div className="flex gap-2 relative w-full">
                {group.columns.map((col, colIndex) => (
                  <div
                    key={col.id}
                    className="flex flex-col gap-2 relative min-w-0"
                    style={{ flex: col.widthRatio || 1 }}
                  >
                    <div
                      className="absolute -left-3 top-0 w-6 h-full z-10"
                      onDragOver={(e) =>
                        onDragOver(e, groupIndex, colIndex, "new-col-left")
                      }
                      onDragLeave={onDragLeave}
                      onDrop={(e) =>
                        onDrop(e, groupIndex, colIndex, "new-col-left")
                      }
                    >
                      {dropTarget?.groupIndex === groupIndex &&
                        dropTarget?.colIndex === colIndex &&
                        dropTarget?.position === "new-col-left" && (
                          <div className="absolute left-1/2 top-[5%] w-1 h-[90%] bg-indigo-500 rounded-sm -translate-x-1/2" />
                        )}
                    </div>

                    <div
                      className="absolute -right-3 top-0 w-6 h-full z-10"
                      onDragOver={(e) =>
                        onDragOver(e, groupIndex, colIndex, "new-col-right")
                      }
                      onDragLeave={onDragLeave}
                      onDrop={(e) =>
                        onDrop(e, groupIndex, colIndex, "new-col-right")
                      }
                    >
                      {dropTarget?.groupIndex === groupIndex &&
                        dropTarget?.colIndex === colIndex &&
                        dropTarget?.position === "new-col-right" && (
                          <div className="absolute left-1/2 top-[5%] w-1 h-[90%] bg-indigo-500 rounded-sm -translate-x-1/2" />
                        )}
                    </div>

                    {col.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className="relative flex flex-col"
                        style={{
                          aspectRatio: `${item.dimensions.width} / ${item.dimensions.height * (item.flex || 1)}`,
                          flexGrow: 1,
                          minHeight: 0,
                        }}
                      >
                        <div
                          className="absolute left-0 right-0 -top-1.5 h-3 z-10"
                          onDragOver={(e) =>
                            onDragOver(
                              e,
                              groupIndex,
                              colIndex,
                              "stack-above",
                              itemIndex,
                            )
                          }
                          onDragLeave={onDragLeave}
                          onDrop={(e) =>
                            onDrop(
                              e,
                              groupIndex,
                              colIndex,
                              "stack-above",
                              itemIndex,
                            )
                          }
                        >
                          {dropTarget?.groupIndex === groupIndex &&
                            dropTarget?.colIndex === colIndex &&
                            dropTarget?.position === "stack-above" &&
                            dropTarget?.itemIndex === itemIndex && (
                              <div className="absolute left-[5%] top-1/2 w-[90%] h-1 bg-indigo-500 rounded-sm -translate-y-1/2" />
                            )}
                        </div>

                        <div
                          className="absolute left-0 right-0 -bottom-1.5 h-3 z-10"
                          onDragOver={(e) =>
                            onDragOver(
                              e,
                              groupIndex,
                              colIndex,
                              "stack-below",
                              itemIndex,
                            )
                          }
                          onDragLeave={onDragLeave}
                          onDrop={(e) =>
                            onDrop(
                              e,
                              groupIndex,
                              colIndex,
                              "stack-below",
                              itemIndex,
                            )
                          }
                        >
                          {dropTarget?.groupIndex === groupIndex &&
                            dropTarget?.colIndex === colIndex &&
                            dropTarget?.position === "stack-below" &&
                            dropTarget?.itemIndex === itemIndex && (
                              <div className="absolute left-[5%] top-1/2 w-[90%] h-1 bg-indigo-500 rounded-sm -translate-y-1/2" />
                            )}
                        </div>

                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStartFromGrid(
                              e,
                              item,
                              groupIndex,
                              colIndex,
                              itemIndex,
                            )
                          }
                          onClick={() =>
                            onSelectItem({ groupIndex, colIndex, itemIndex })
                          }
                          className={`flex-1 min-h-0 rounded-md overflow-hidden cursor-grab relative ${
                            selectedItem?.groupIndex === groupIndex &&
                            selectedItem?.colIndex === colIndex &&
                            selectedItem?.itemIndex === itemIndex
                              ? "outline-[3px] outline outline-indigo-500 outline-offset-2"
                              : ""
                          }`}
                        >
                          <GridImage src={item.src} />

                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {col.widthRatio && col.widthRatio !== 1 && (
                              <div className="px-1.5 py-0.5 bg-emerald-500/90 rounded text-white text-[0.65rem] font-semibold">
                                가로 ×{col.widthRatio.toFixed(1)}
                              </div>
                            )}
                            {item.flex && item.flex !== 1 && (
                              <div className="px-1.5 py-0.5 bg-indigo-500/90 rounded text-white text-[0.65rem] font-semibold">
                                세로 ×{item.flex.toFixed(1)}
                              </div>
                            )}
                          </div>

                          <input
                            type="text"
                            value={item.caption || ""}
                            onChange={(e) =>
                              onUpdateCaption(
                                groupIndex,
                                colIndex,
                                itemIndex,
                                e.target.value,
                              )
                            }
                            placeholder="캡션"
                            className="absolute bottom-0 left-0 right-0 p-1.5 bg-caption-gradient border-none text-white text-[0.75rem] text-center"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {selectedItem?.groupIndex === groupIndex &&
                            selectedItem?.colIndex === colIndex &&
                            selectedItem?.itemIndex === itemIndex && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(groupIndex, colIndex, itemIndex);
                                }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded border-none bg-red-500/90 text-white cursor-pointer text-[0.8rem]"
                              >
                                ✕
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div
                className="h-5 mt-1 relative"
                onDragOver={(e) =>
                  onDragOver(e, groupIndex, 0, "new-group-below")
                }
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, groupIndex, 0, "new-group-below")}
              >
                {dropTarget?.groupIndex === groupIndex &&
                  dropTarget?.position === "new-group-below" && (
                    <div className="absolute left-[2%] top-1/2 w-[96%] h-1 bg-indigo-500 rounded-sm -translate-y-1/2" />
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
