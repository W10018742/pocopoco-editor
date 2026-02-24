import type { RowGroup, SelectedItem } from "../types";

interface SettingsBarProps {
  leftWidth: number;
  onLeftWidthChange: (width: number) => void;
  selectedItem: SelectedItem | null;
  rowGroups: RowGroup[];
  onUpdateWidthRatio: (
    groupIndex: number,
    colIndex: number,
    delta: number,
  ) => void;
  onUpdateFlex: (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
    delta: number,
  ) => void;
}

export function SettingsBar({
  leftWidth,
  onLeftWidthChange,
  selectedItem,
  rowGroups,
  onUpdateWidthRatio,
  onUpdateFlex,
}: SettingsBarProps) {
  return (
    <div className="flex gap-6 px-5 py-2.5 bg-surface border-b border-edge items-center">
      <div className="flex items-center gap-2.5 text-content-secondary text-[0.8rem]">
        <label>좌우 비율</label>
        <input
          type="range"
          min="40"
          max="75"
          value={leftWidth}
          onChange={(e) => onLeftWidthChange(Number(e.target.value))}
          className="w-[100px] accent-violet-400"
        />
        <span className="text-violet-400 font-semibold">{leftWidth}%</span>
      </div>
      {selectedItem && (
        <div className="flex gap-3 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-card rounded-lg">
            <span className="text-content-secondary text-[0.8rem]">가로:</span>
            <button
              onClick={() =>
                onUpdateWidthRatio(
                  selectedItem.groupIndex,
                  selectedItem.colIndex,
                  -0.1,
                )
              }
              className="w-7 h-7 rounded-md border-none bg-indigo-500 text-white cursor-pointer text-lg font-bold flex items-center justify-center"
            >
              −
            </button>
            <span className="text-violet-400 font-bold text-base min-w-[40px] text-center">
              {(
                rowGroups[selectedItem.groupIndex]?.columns[
                  selectedItem.colIndex
                ]?.widthRatio || 1
              ).toFixed(1)}
            </span>
            <button
              onClick={() =>
                onUpdateWidthRatio(
                  selectedItem.groupIndex,
                  selectedItem.colIndex,
                  0.1,
                )
              }
              className="w-7 h-7 rounded-md border-none bg-indigo-500 text-white cursor-pointer text-lg font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-card rounded-lg">
            <span className="text-content-secondary text-[0.8rem]">세로:</span>
            <button
              onClick={() =>
                onUpdateFlex(
                  selectedItem.groupIndex,
                  selectedItem.colIndex,
                  selectedItem.itemIndex,
                  -0.1,
                )
              }
              className="w-7 h-7 rounded-md border-none bg-indigo-500 text-white cursor-pointer text-lg font-bold flex items-center justify-center"
            >
              −
            </button>
            <span className="text-violet-400 font-bold text-base min-w-[40px] text-center">
              {(
                rowGroups[selectedItem.groupIndex]?.columns[
                  selectedItem.colIndex
                ]?.items[selectedItem.itemIndex]?.flex || 1
              ).toFixed(1)}
            </span>
            <button
              onClick={() =>
                onUpdateFlex(
                  selectedItem.groupIndex,
                  selectedItem.colIndex,
                  selectedItem.itemIndex,
                  0.1,
                )
              }
              className="w-7 h-7 rounded-md border-none bg-indigo-500 text-white cursor-pointer text-lg font-bold flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
