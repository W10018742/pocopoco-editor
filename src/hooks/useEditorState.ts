import { useCallback, useRef, useState } from "react";
import type {
  DraggedImage,
  DropTarget,
  RowGroup,
  InfoItem,
  PoolImage,
  SelectedItem,
} from "../types";
import { generateId } from "../utils";
import type { TourApplyData } from "../components/TourSearchPanel";
import { useHistory } from "./useHistory";

export function useEditorState() {
  const [rowGroups, setRowGroupsRaw] = useState<RowGroup[]>([]);
  const rowGroupsRef = useRef<RowGroup[]>(rowGroups);
  rowGroupsRef.current = rowGroups;

  const history = useHistory<RowGroup[]>();

  const setRowGroups = useCallback(
    (groups: RowGroup[]) => {
      history.pushState(rowGroupsRef.current);
      setRowGroupsRaw(groups);
    },
    [history],
  );

  const undo = useCallback(() => {
    const previous = history.undo(rowGroupsRef.current);
    if (previous !== null) {
      setRowGroupsRaw(previous);
    }
  }, [history]);

  const redo = useCallback(() => {
    const next = history.redo(rowGroupsRef.current);
    if (next !== null) {
      setRowGroupsRaw(next);
    }
  }, [history]);
  const [leftWidth, setLeftWidth] = useState(60);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");

  const [infoItems, setInfoItems] = useState<InfoItem[]>([
    { id: generateId(), title: "관람 시간", content: "", note: "" },
  ]);

  const [images, setImages] = useState<PoolImage[]>([]);

  const [draggedImage, setDraggedImage] = useState<DraggedImage | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [importJsonText, setImportJsonText] = useState("");
  const [jsonFileName, setJsonFileName] = useState("DT_EX0000.json");
  const [imageUrl, setImageUrl] = useState("");
  const [editingImage, setEditingImage] = useState<string | null>(null);

  const [pendingTourData, setPendingTourData] = useState<TourApplyData | null>(
    null,
  );

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTourLoading, setIsTourLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return {
    rowGroups,
    setRowGroups,
    leftWidth,
    setLeftWidth,
    title,
    setTitle,
    description,
    setDescription,
    note,
    setNote,
    infoItems,
    setInfoItems,
    images,
    setImages,
    draggedImage,
    setDraggedImage,
    dropTarget,
    setDropTarget,
    selectedItem,
    setSelectedItem,
    showJsonModal,
    setShowJsonModal,
    showImportModal,
    setShowImportModal,
    showUrlModal,
    setShowUrlModal,
    showImageEditor,
    setShowImageEditor,
    showSearchPanel,
    setShowSearchPanel,
    showGenerateModal,
    setShowGenerateModal,
    showSettingsModal,
    setShowSettingsModal,
    importJsonText,
    setImportJsonText,
    jsonFileName,
    setJsonFileName,
    imageUrl,
    setImageUrl,
    editingImage,
    setEditingImage,
    pendingTourData,
    setPendingTourData,
    isPreviewMode,
    setIsPreviewMode,
    isTourLoading,
    setIsTourLoading,
    fileInputRef,
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
  };
}

export type EditorState = ReturnType<typeof useEditorState>;
