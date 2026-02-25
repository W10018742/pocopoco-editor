import type {
  Column,
  DraggedImage,
  DropTarget,
  GridItem,
  PoolImage,
  RowGroup,
} from "../types";
import { generateId, validateImageSrc } from "../utils";

interface UseDragDropParams {
  rowGroups: RowGroup[];
  setRowGroups: (groups: RowGroup[]) => void;
  draggedImage: DraggedImage | null;
  setDraggedImage: (img: DraggedImage | null) => void;
  setDropTarget: (target: DropTarget | null) => void;
}

export function useDragDrop({
  rowGroups,
  setRowGroups,
  draggedImage,
  setDraggedImage,
  setDropTarget,
}: UseDragDropParams) {
  const handleDragStartFromPool = (e: React.DragEvent, image: PoolImage) => {
    setDraggedImage({ ...image, fromPool: true });
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragStartFromGrid = (
    e: React.DragEvent,
    image: GridItem,
    groupIndex: number,
    colIndex: number,
    itemIndex: number,
  ) => {
    setDraggedImage({
      ...image,
      fromPool: false,
      sourceGroup: groupIndex,
      sourceCol: colIndex,
      sourceItem: itemIndex,
    });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent,
    groupIndex: number,
    colIndex: number,
    position: string,
    itemIndex: number | null = null,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ groupIndex, colIndex, position, itemIndex });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const removeFromSource = (groups: RowGroup[]): RowGroup[] => {
    if (
      !draggedImage ||
      draggedImage.fromPool ||
      draggedImage.sourceGroup === undefined
    )
      return JSON.parse(JSON.stringify(groups));

    let newGroups: RowGroup[] = JSON.parse(JSON.stringify(groups));
    const srcGroup = newGroups[draggedImage.sourceGroup];
    if (!srcGroup) return newGroups;

    const srcCol = srcGroup.columns[draggedImage.sourceCol!];
    if (!srcCol) return newGroups;

    srcCol.items = srcCol.items.filter(
      (_: GridItem, idx: number) => idx !== draggedImage.sourceItem,
    );

    if (srcCol.items.length === 0) {
      srcGroup.columns = srcGroup.columns.filter(
        (_: Column, idx: number) => idx !== draggedImage.sourceCol,
      );
    }

    if (srcGroup.columns.length === 0) {
      newGroups = newGroups.filter(
        (_: RowGroup, idx: number) => idx !== draggedImage.sourceGroup,
      );
    }

    return newGroups;
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetGroupIndex: number,
    targetColIndex: number,
    position: string,
    targetItemIndex: number | null = null,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedImage) return;

    if (draggedImage.fromPool) {
      const valid = await validateImageSrc(draggedImage.src);
      if (!valid) {
        setDraggedImage(null);
        setDropTarget(null);
        return;
      }
    }

    let newGroups = removeFromSource(rowGroups);

    if (!draggedImage.fromPool && draggedImage.sourceGroup !== undefined) {
      const srcGroupIdx = draggedImage.sourceGroup;
      const srcColIdx = draggedImage.sourceCol!;
      const srcGroupRemoved =
        !newGroups[srcGroupIdx] ||
        (rowGroups[srcGroupIdx]?.columns.length === 1 &&
          rowGroups[srcGroupIdx]?.columns[0]?.items.length === 1);

      if (srcGroupRemoved && targetGroupIndex > srcGroupIdx) {
        targetGroupIndex--;
      }

      if (
        !srcGroupRemoved &&
        targetGroupIndex === srcGroupIdx &&
        rowGroups[srcGroupIdx]?.columns[srcColIdx]?.items.length === 1
      ) {
        if (targetColIndex > srcColIdx) {
          targetColIndex--;
        }
      }
    }

    const imageData = {
      id: generateId(),
      src: draggedImage.src,
      dimensions: draggedImage.dimensions,
      caption: draggedImage.caption || "",
      flex: draggedImage.flex || 1,
    };

    if (position === "new-group") {
      newGroups.push({
        id: generateId(),
        columns: [{ id: generateId(), items: [imageData], widthRatio: 1 }],
      });
    } else if (position === "new-group-above") {
      newGroups.splice(targetGroupIndex, 0, {
        id: generateId(),
        columns: [{ id: generateId(), items: [imageData], widthRatio: 1 }],
      });
    } else if (position === "new-group-below") {
      newGroups.splice(targetGroupIndex + 1, 0, {
        id: generateId(),
        columns: [{ id: generateId(), items: [imageData], widthRatio: 1 }],
      });
    } else if (position === "new-col-left") {
      if (newGroups[targetGroupIndex]) {
        newGroups[targetGroupIndex].columns.splice(targetColIndex, 0, {
          id: generateId(),
          items: [imageData],
          widthRatio: 1,
        });
      }
    } else if (position === "new-col-right") {
      if (newGroups[targetGroupIndex]) {
        newGroups[targetGroupIndex].columns.splice(targetColIndex + 1, 0, {
          id: generateId(),
          items: [imageData],
          widthRatio: 1,
        });
      }
    } else if (position === "stack-above" && targetItemIndex !== null) {
      if (newGroups[targetGroupIndex]?.columns[targetColIndex]) {
        newGroups[targetGroupIndex].columns[targetColIndex].items.splice(
          targetItemIndex,
          0,
          imageData,
        );
      }
    } else if (position === "stack-below" && targetItemIndex !== null) {
      if (newGroups[targetGroupIndex]?.columns[targetColIndex]) {
        newGroups[targetGroupIndex].columns[targetColIndex].items.splice(
          targetItemIndex + 1,
          0,
          imageData,
        );
      }
    }

    setRowGroups(newGroups);
    setDraggedImage(null);
    setDropTarget(null);
  };

  const handleDropOnEmpty = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedImage) return;

    if (draggedImage.fromPool) {
      const valid = await validateImageSrc(draggedImage.src);
      if (!valid) {
        setDraggedImage(null);
        setDropTarget(null);
        return;
      }
    }

    let newGroups = removeFromSource(rowGroups);

    const imageData = {
      id: generateId(),
      src: draggedImage.src,
      dimensions: draggedImage.dimensions,
      caption: draggedImage.caption || "",
      flex: 1,
    };

    newGroups.push({
      id: generateId(),
      columns: [{ id: generateId(), items: [imageData], widthRatio: 1 }],
    });

    setRowGroups(newGroups);
    setDraggedImage(null);
    setDropTarget(null);
  };

  return {
    handleDragStartFromPool,
    handleDragStartFromGrid,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropOnEmpty,
  };
}
