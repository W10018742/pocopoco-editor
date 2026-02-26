import type { SetStateAction } from "react";
import type {
  Column,
  GridItem,
  ImageDimensions,
  InfoItem,
  PoolImage,
  RowGroup,
} from "../types";
import { generateId, getImageDimensions } from "../utils";

interface UseJsonOperationsParams {
  title: string;
  description: string;
  note: string;
  status: string;
  leftWidth: number;
  infoItems: InfoItem[];
  rowGroups: RowGroup[];
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setNote: (v: string) => void;
  setStatus: (v: string) => void;
  setLeftWidth: (v: number) => void;
  setInfoItems: (items: InfoItem[]) => void;
  setRowGroups: (groups: RowGroup[]) => void;
  setImages: (value: SetStateAction<PoolImage[]>) => void;
  setShowImportModal: (v: boolean) => void;
  setImportJsonText: (v: string) => void;
  jsonFileName: string;
  setJsonFileName: (v: string) => void;
}

export function useJsonOperations({
  title,
  description,
  note,
  status,
  leftWidth,
  infoItems,
  rowGroups,
  setTitle,
  setDescription,
  setNote,
  setStatus,
  setLeftWidth,
  setInfoItems,
  setRowGroups,
  setImages,
  setShowImportModal,
  setImportJsonText,
  jsonFileName,
  setJsonFileName,
}: UseJsonOperationsParams) {
  const exportJson = () => {
    const data: Record<string, any> = {
      TITLE: title,
      DESCRIPTION: description,
      NOTE: note,
      ...(status ? { STATUS: status } : {}),
      LAYOUT_SETTINGS: {
        LEFT_WIDTH: leftWidth,
      },
      INFO: infoItems.map((item) => {
        const info: Record<string, string> = {
          INFO_TITLE: item.title || "",
          CONTENT: item.content || "",
        };
        if (item.note) {
          info.INFO_NOTE = item.note;
        }
        return info;
      }),
      INNER_IMAGES: rowGroups.flatMap((group, groupIndex) =>
        group.columns.flatMap((col, colIndex) =>
          col.items.map((item, itemIndex) => ({
            TITLE: item.caption || "",
            IMAGE_FILE:
              item.fileName ||
              `img_${String(groupIndex * 10 + colIndex * 3 + itemIndex + 1).padStart(2, "0")}.jpg`,
            IMAGE_SRC: item.src,
            POSITION: {
              GROUP: groupIndex,
              COL: colIndex,
              ITEM: itemIndex,
              WIDTH_RATIO: col.widthRatio || 1,
              FLEX: item.flex || 1,
            },
          })),
        ),
      ),
    };
    return data;
  };

  const hasNonCdnImages = (): boolean => {
    return rowGroups.some((group) =>
      group.columns.some((col) =>
        col.items.some(
          (item) =>
            item.src.startsWith("data:") || item.src.startsWith("blob:"),
        ),
      ),
    );
  };

  const confirmExportIfNeeded = (): boolean => {
    if (hasNonCdnImages()) {
      return confirm(
        "일부 이미지가 아직 CDN에 업로드되지 않았습니다.\n" +
          "로컬 데이터 URL이 포함된 JSON은 다른 환경에서 이미지가 표시되지 않을 수 있습니다.\n\n" +
          "계속 내보내시겠습니까?",
      );
    }
    return true;
  };

  const copyJsonToClipboard = () => {
    if (!confirmExportIfNeeded()) return;
    const json = JSON.stringify(exportJson(), null, 2);
    navigator.clipboard.writeText(json);
    alert("JSON이 클립보드에 복사되었습니다!");
  };

  const downloadJson = () => {
    if (!confirmExportIfNeeded()) return;
    const json = JSON.stringify(exportJson(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = jsonFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (jsonData: string | Record<string, any>) => {
    try {
      const data: any =
        typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      setTitle(data.TITLE || "");
      setDescription(data.DESCRIPTION || "");
      setNote(data.NOTE || "");
      setStatus(data.STATUS || "");

      if (data.LAYOUT_SETTINGS?.LEFT_WIDTH) {
        setLeftWidth(data.LAYOUT_SETTINGS.LEFT_WIDTH);
      }

      if (data.INFO && Array.isArray(data.INFO)) {
        const newInfoItems = data.INFO.map((item: any) => ({
          id: generateId(),
          title: item.INFO_TITLE || "",
          content: item.CONTENT || "",
          note: item.INFO_NOTE || "",
        }));
        setInfoItems(
          newInfoItems.length > 0
            ? newInfoItems
            : [{ id: generateId(), title: "관람 시간", content: "", note: "" }],
        );
      }

      if (data.INNER_IMAGES && Array.isArray(data.INNER_IMAGES)) {
        const groupsMap = new Map<number, Map<number, any>>();
        const newImages: PoolImage[] = [];

        const skippedImages: string[] = [];

        for (const img of data.INNER_IMAGES as any[]) {
          if (!img.IMAGE_SRC) continue;

          let dimensions: ImageDimensions;
          try {
            dimensions = await getImageDimensions(img.IMAGE_SRC);
          } catch {
            skippedImages.push(img.IMAGE_FILE || img.IMAGE_SRC);
            continue;
          }

          const pos = img.POSITION || { GROUP: 0, COL: 0, ITEM: 0 };
          const groupKey: number = pos.GROUP;
          const colKey: number = pos.COL;

          if (!groupsMap.has(groupKey)) {
            groupsMap.set(groupKey, new Map());
          }

          const colsMap = groupsMap.get(groupKey)!;
          if (!colsMap.has(colKey)) {
            colsMap.set(colKey, {
              id: generateId(),
              widthRatio: pos.WIDTH_RATIO || 1,
              items: [] as GridItem[],
            });
          }

          const col = colsMap.get(colKey);

          const imageData: GridItem = {
            id: generateId(),
            src: img.IMAGE_SRC,
            fileName: img.IMAGE_FILE || "",
            caption: img.TITLE || "",
            flex: pos.FLEX || 1,
            dimensions,
          };

          col.items[pos.ITEM] = imageData;

          newImages.push({
            id: generateId(),
            src: img.IMAGE_SRC,
            dimensions,
            caption: img.TITLE || "",
          });
        }

        if (skippedImages.length > 0) {
          alert(
            `${skippedImages.length}개의 이미지를 불러올 수 없어 제외되었습니다.\n\n${skippedImages.join("\n")}`,
          );
        }

        const newRowGroups: RowGroup[] = [];
        const sortedGroupKeys = Array.from(groupsMap.keys()).sort(
          (a, b) => a - b,
        );

        for (const groupKey of sortedGroupKeys) {
          const colsMap = groupsMap.get(groupKey)!;
          const sortedColKeys = Array.from(colsMap.keys()).sort(
            (a, b) => a - b,
          );

          const columns: Column[] = sortedColKeys.map((colKey) => {
            const col = colsMap.get(colKey);
            col.items = col.items.filter(
              (item: GridItem | undefined) => item !== undefined,
            );
            return col as Column;
          });

          newRowGroups.push({
            id: generateId(),
            columns,
          });
        }

        setRowGroups(newRowGroups);
        setImages(newImages);
      }

      setShowImportModal(false);
      setImportJsonText("");
    } catch (error) {
      console.error("JSON 파싱 오류:", error);
      alert("JSON 형식이 올바르지 않습니다. 다시 확인해주세요.");
    }
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === "string") {
        setImportJsonText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return {
    exportJson,
    copyJsonToClipboard,
    downloadJson,
    importJson,
    handleJsonFileSelect,
  };
}
