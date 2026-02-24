export interface ImageDimensions {
  width: number;
  height: number;
  ratio: number;
}

export type UploadStatus = "uploading" | "success" | "error";

export interface PoolImage {
  id: string;
  src: string;
  dimensions: ImageDimensions;
  caption: string;
  uploadStatus?: UploadStatus;
}

export interface GridItem {
  id: string;
  src: string;
  dimensions: ImageDimensions;
  caption: string;
  flex: number;
  fileName?: string;
}

export interface Column {
  id: string;
  items: GridItem[];
  widthRatio: number;
}

export interface RowGroup {
  id: string;
  columns: Column[];
}

export interface InfoItem {
  id: string;
  title: string;
  content: string;
  note: string;
}

export interface DraggedImage extends PoolImage {
  fromPool: boolean;
  sourceGroup?: number;
  sourceCol?: number;
  sourceItem?: number;
  flex?: number;
}

export interface DropTarget {
  groupIndex?: number;
  colIndex?: number;
  position: string;
  itemIndex?: number | null;
}

export interface SelectedItem {
  groupIndex: number;
  colIndex: number;
  itemIndex: number;
}

export interface EditResult {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  fileName?: string;
}
