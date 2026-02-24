import type { InfoItem } from "../types";
import { generateId } from "../utils";

interface UseInfoItemsParams {
  infoItems: InfoItem[];
  setInfoItems: (items: InfoItem[]) => void;
}

export function useInfoItems({ infoItems, setInfoItems }: UseInfoItemsParams) {
  const addInfoItem = () => {
    setInfoItems([
      ...infoItems,
      { id: generateId(), title: "", content: "", note: "" },
    ]);
  };

  const updateInfoItem = (id: string, field: keyof InfoItem, value: string) => {
    setInfoItems(
      infoItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const deleteInfoItem = (id: string) => {
    setInfoItems(infoItems.filter((item) => item.id !== id));
  };

  const moveInfoItem = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= infoItems.length) return;
    const newItems = [...infoItems];
    [newItems[index], newItems[newIndex]] = [newItems[index], newItems[index]];
    setInfoItems(newItems);
  };

  return { addInfoItem, updateInfoItem, deleteInfoItem, moveInfoItem };
}
