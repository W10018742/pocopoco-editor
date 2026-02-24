import type { RowGroup, SelectedItem } from "../types";

interface UseGridOperationsParams {
  rowGroups: RowGroup[];
  setRowGroups: (groups: RowGroup[]) => void;
  setSelectedItem: (item: SelectedItem | null) => void;
}

export function useGridOperations({
  rowGroups,
  setRowGroups,
  setSelectedItem,
}: UseGridOperationsParams) {
  const deleteItem = (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
  ) => {
    let newGroups = JSON.parse(JSON.stringify(rowGroups));
    newGroups[groupIndex].columns[colIndex].items.splice(itemIndex, 1);

    if (newGroups[groupIndex].columns[colIndex].items.length === 0) {
      newGroups[groupIndex].columns.splice(colIndex, 1);
    }
    if (newGroups[groupIndex].columns.length === 0) {
      newGroups.splice(groupIndex, 1);
    }

    setRowGroups(newGroups);
    setSelectedItem(null);
  };

  const updateCaption = (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
    caption: string,
  ) => {
    let newGroups = JSON.parse(JSON.stringify(rowGroups));
    newGroups[groupIndex].columns[colIndex].items[itemIndex].caption = caption;
    setRowGroups(newGroups);
  };

  const updateFlex = (
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
    delta: number,
  ) => {
    let newGroups = JSON.parse(JSON.stringify(rowGroups));
    const item = newGroups[groupIndex].columns[colIndex].items[itemIndex];
    const currentFlex = item.flex || 1;
    const newFlex = Math.round(Math.max(0.1, Math.min(4, currentFlex + delta)) * 10) / 10;
    item.flex = newFlex;
    setRowGroups(newGroups);
  };

  const updateWidthRatio = (
    groupIndex: number,
    colIndex: number,
    delta: number,
  ) => {
    let newGroups = JSON.parse(JSON.stringify(rowGroups));
    const col = newGroups[groupIndex].columns[colIndex];
    const currentRatio = col.widthRatio || 1;
    const newRatio = Math.round(Math.max(0.1, Math.min(4, currentRatio + delta)) * 10) / 10;
    col.widthRatio = newRatio;
    setRowGroups(newGroups);
  };

  return { deleteItem, updateCaption, updateFlex, updateWidthRatio };
}
