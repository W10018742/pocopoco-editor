import { useEffect, useState } from "react";
import sampleData from "./assets/DT_EX0001.json";
import { ContentPanel } from "./components/ContentPanel";
import { EditorFooter } from "./components/EditorFooter";
import { EditorHeader } from "./components/EditorHeader";
import { GridLayout } from "./components/GridLayout";
import ImageEditor from "./components/ImageEditor";
import { ImagePool } from "./components/ImagePool";
import { ImageGenerateModal } from "./components/ImageGenerateModal";
import { ImageUrlModal } from "./components/ImageUrlModal";
import { InfoItemsSection } from "./components/InfoItemsSection";
import { JsonExportModal } from "./components/JsonExportModal";
import { JsonImportModal } from "./components/JsonImportModal";
import { KeyGate } from "./components/KeyGate";
import PreviewMode from "./components/PreviewMode";
import { SettingsBar } from "./components/SettingsBar";
import { SettingsModal } from "./components/SettingsModal";
import TourApplyDiffModal from "./components/TourApplyDiffModal";
import TourSearchPanel from "./components/TourSearchPanel";
import { useDragDrop } from "./hooks/useDragDrop";
import { useEditorState } from "./hooks/useEditorState";
import { useGridOperations } from "./hooks/useGridOperations";
import { useImageUpload } from "./hooks/useImageUpload";
import { useInfoItems } from "./hooks/useInfoItems";
import { useJsonOperations } from "./hooks/useJsonOperations";
import { useTheme } from "./hooks/useTheme";
import { useTourApi } from "./hooks/useTourApi";
import { getApiKey } from "./services/apiKeyManager";

function App() {
  const [unlocked, setUnlocked] = useState(
    () => Boolean(getApiKey("ncp_access_key") && getApiKey("ncp_secret_key")),
  );
  const state = useEditorState();
  const { theme, toggleTheme } = useTheme();

  const dragDrop = useDragDrop({
    rowGroups: state.rowGroups,
    setRowGroups: state.setRowGroups,
    draggedImage: state.draggedImage,
    setDraggedImage: state.setDraggedImage,
    setDropTarget: state.setDropTarget,
  });

  const gridOps = useGridOperations({
    rowGroups: state.rowGroups,
    setRowGroups: state.setRowGroups,
    setSelectedItem: state.setSelectedItem,
  });

  const jsonOps = useJsonOperations({
    title: state.title,
    description: state.description,
    note: state.note,
    leftWidth: state.leftWidth,
    infoItems: state.infoItems,
    rowGroups: state.rowGroups,
    setTitle: state.setTitle,
    setDescription: state.setDescription,
    setNote: state.setNote,
    setLeftWidth: state.setLeftWidth,
    setInfoItems: state.setInfoItems,
    setRowGroups: state.setRowGroups,
    setImages: state.setImages,
    setShowImportModal: state.setShowImportModal,
    setImportJsonText: state.setImportJsonText,
    jsonFileName: state.jsonFileName,
    setJsonFileName: state.setJsonFileName,
  });

  const imageUpload = useImageUpload({
    setImages: state.setImages,
    imageUrl: state.imageUrl,
    setImageUrl: state.setImageUrl,
    setEditingImage: state.setEditingImage,
    setShowImageEditor: state.setShowImageEditor,
    setShowUrlModal: state.setShowUrlModal,
  });

  const infoItemOps = useInfoItems({
    infoItems: state.infoItems,
    setInfoItems: state.setInfoItems,
  });

  const tourApi = useTourApi({
    title: state.title,
    description: state.description,
    note: state.note,
    infoItems: state.infoItems,
    images: state.images,
    pendingTourData: state.pendingTourData,
    setTitle: state.setTitle,
    setDescription: state.setDescription,
    setNote: state.setNote,
    setInfoItems: state.setInfoItems,
    setImages: state.setImages,
    setPendingTourData: state.setPendingTourData,
    setShowSearchPanel: state.setShowSearchPanel,
    setIsTourLoading: state.setIsTourLoading,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        state.undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "y")
      ) {
        e.preventDefault();
        state.redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.undo, state.redo]);

  if (!unlocked) {
    return <KeyGate onUnlock={() => setUnlocked(true)} />;
  }

  if (state.showImageEditor && state.editingImage) {
    return (
      <ImageEditor
        imageSrc={state.editingImage}
        onSave={imageUpload.handleImageEditComplete}
        onCancel={imageUpload.handleImageEditCancel}
      />
    );
  }

  if (state.isPreviewMode) {
    return (
      <PreviewMode
        rowGroups={state.rowGroups}
        leftWidth={state.leftWidth}
        title={state.title}
        description={state.description}
        note={state.note}
        infoItems={state.infoItems}
        onClose={() => state.setIsPreviewMode(false)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-surface font-['Pretendard',-apple-system,sans-serif] text-content">
        <input
          ref={state.fileInputRef}
          type="file"
          accept="image/*"
          onChange={imageUpload.handleFileSelect}
          className="hidden"
        />

        <EditorHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSearchPanel={() => state.setShowSearchPanel(true)}
          onOpenSettings={() => state.setShowSettingsModal(true)}
          onLoadSample={() => jsonOps.importJson(sampleData)}
          onOpenImportModal={() => state.setShowImportModal(true)}
          onOpenExportModal={() => state.setShowJsonModal(true)}
          onTogglePreview={() => state.setIsPreviewMode(true)}
        />

        <SettingsModal
          isOpen={state.showSettingsModal}
          onClose={() => state.setShowSettingsModal(false)}
        />

        <JsonExportModal
          isOpen={state.showJsonModal}
          exportData={jsonOps.exportJson()}
          onCopy={jsonOps.copyJsonToClipboard}
          onDownload={jsonOps.downloadJson}
          onClose={() => state.setShowJsonModal(false)}
        />

        <JsonImportModal
          isOpen={state.showImportModal}
          importJsonText={state.importJsonText}
          onImportJsonTextChange={state.setImportJsonText}
          onImport={() => jsonOps.importJson(state.importJsonText)}
          onJsonFileSelect={jsonOps.handleJsonFileSelect}
          onClose={() => {
            state.setShowImportModal(false);
            state.setImportJsonText("");
          }}
        />

        <ImageUrlModal
          isOpen={state.showUrlModal}
          imageUrl={state.imageUrl}
          onImageUrlChange={state.setImageUrl}
          onAdd={imageUpload.handleAddImageByUrl}
          onAddDirect={imageUpload.handleAddImageByUrlDirect}
          onClose={() => {
            state.setShowUrlModal(false);
            state.setImageUrl("");
          }}
        />

        <ImageGenerateModal
          isOpen={state.showGenerateModal}
          onAddToPool={(imageDataUrl: string) => {
            state.setEditingImage(imageDataUrl);
            state.setShowImageEditor(true);
          }}
          onClose={() => state.setShowGenerateModal(false)}
          onOpenSettings={() => {
            state.setShowGenerateModal(false);
            state.setShowSettingsModal(true);
          }}
        />

        <ImagePool
          images={state.images}
          onFileUploadClick={() => state.fileInputRef.current?.click()}
          onUrlAddClick={() => state.setShowUrlModal(true)}
          onAiGenerateClick={() => state.setShowGenerateModal(true)}
          onDragStartFromPool={dragDrop.handleDragStartFromPool}
          onDeleteImage={(id) =>
            state.setImages((prev) => prev.filter((img) => img.id !== id))
          }
        />

        <SettingsBar
          leftWidth={state.leftWidth}
          onLeftWidthChange={state.setLeftWidth}
          selectedItem={state.selectedItem}
          rowGroups={state.rowGroups}
          onUpdateWidthRatio={gridOps.updateWidthRatio}
          onUpdateFlex={gridOps.updateFlex}
        />

        <div className="flex h-[calc(100vh-380px)] min-h-[300px]">
          <GridLayout
            rowGroups={state.rowGroups}
            leftWidth={state.leftWidth}
            dropTarget={state.dropTarget}
            selectedItem={state.selectedItem}
            onDragStartFromGrid={dragDrop.handleDragStartFromGrid}
            onDragOver={dragDrop.handleDragOver}
            onDragLeave={dragDrop.handleDragLeave}
            onDrop={dragDrop.handleDrop}
            onDropOnEmpty={dragDrop.handleDropOnEmpty}
            onSelectItem={state.setSelectedItem}
            onDeleteItem={gridOps.deleteItem}
            onUpdateCaption={gridOps.updateCaption}
            onUndo={state.undo}
            onRedo={state.redo}
            canUndo={state.canUndo}
            canRedo={state.canRedo}
          />

          <div className="w-1 bg-edge" />

          <ContentPanel
            leftWidth={state.leftWidth}
            title={state.title}
            description={state.description}
            note={state.note}
            onTitleChange={state.setTitle}
            onDescriptionChange={state.setDescription}
            onNoteChange={state.setNote}
          />
        </div>

        <InfoItemsSection
          infoItems={state.infoItems}
          onAdd={infoItemOps.addInfoItem}
          onUpdate={infoItemOps.updateInfoItem}
          onDelete={infoItemOps.deleteInfoItem}
          onMove={infoItemOps.moveInfoItem}
        />

        <EditorFooter />

        <TourSearchPanel
          isOpen={state.showSearchPanel}
          onClose={() => state.setShowSearchPanel(false)}
          onApply={tourApi.applyTourData}
        />

        {state.pendingTourData && (
          <TourApplyDiffModal
            currentData={tourApi.getCurrentEditorData()}
            incomingData={state.pendingTourData}
            onConfirm={tourApi.confirmApplyTourData}
            onClose={() => state.setPendingTourData(null)}
          />
        )}
      </div>
    </>
  );
}

export default App;
