import { useEffect, useCallback } from "react";
import type { TourApplyData } from "../components/TourSearchPanel";
import type {
  DiffSelections,
  EditorCurrentData,
} from "../components/TourApplyDiffModal";
import { generateId, getImageDimensions } from "../utils";
import type { PoolImage, InfoItem } from "../types";
import { extractOperatingInfo, getFullDetail } from "../lib/tourapi";

interface UseTourApiParams {
  title: string;
  description: string;
  note: string;
  infoItems: InfoItem[];
  images: PoolImage[];
  pendingTourData: TourApplyData | null;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setNote: (v: string) => void;
  setInfoItems: React.Dispatch<React.SetStateAction<InfoItem[]>>;
  setImages: React.Dispatch<React.SetStateAction<PoolImage[]>>;
  setPendingTourData: (v: TourApplyData | null) => void;
  setShowSearchPanel: (v: boolean) => void;
  setIsTourLoading: (v: boolean) => void;
}

export function useTourApi({
  title,
  description,
  note,
  infoItems,
  images,
  pendingTourData,
  setTitle,
  setDescription,
  setNote,
  setInfoItems,
  setImages,
  setPendingTourData,
  setShowSearchPanel,
  setIsTourLoading,
}: UseTourApiParams) {
  const applyTourData = useCallback(
    (data: TourApplyData) => {
      setPendingTourData(data);
      setShowSearchPanel(false);
    },
    [setPendingTourData, setShowSearchPanel],
  );

  const confirmApplyTourData = useCallback(
    async (selections: DiffSelections) => {
      if (!pendingTourData) return;

      try {
        const data = pendingTourData;

        if (selections.title === "incoming") {
          setTitle(data.title);
        }
        if (selections.description === "incoming") {
          setDescription(data.description);
        }
        if (selections.note === "incoming") {
          setNote(data.note);
        }
        if (selections.info === "incoming" && data.info.length > 0) {
          setInfoItems(
            data.info.map((item) => ({
              id: generateId(),
              title: item.title,
              content: item.content,
              note: "",
            })),
          );
        }
        if (selections.info === "merge" && data.info.length > 0) {
          setInfoItems((prev) => {
            const incomingItems = data.info
              .filter(
                (inc) =>
                  !prev.some(
                    (cur) =>
                      cur.title === inc.title && cur.content === inc.content,
                  ),
              )
              .map((item) => ({
                id: generateId(),
                title: item.title,
                content: item.content,
                note: "",
              }));
            return [...prev, ...incomingItems];
          });
        }
        if (selections.images === "add" && data.images.length > 0) {
          const newImages: PoolImage[] = [];
          for (const img of data.images) {
            try {
              const dimensions = await getImageDimensions(img.src);
              newImages.push({
                id: generateId(),
                src: img.src,
                dimensions,
                caption: img.caption,
              });
            } catch {
              newImages.push({
                id: generateId(),
                src: img.src,
                dimensions: { width: 800, height: 600, ratio: 4 / 3 },
                caption: img.caption,
              });
            }
          }
          setImages((prev) => [...prev, ...newImages]);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "데이터 적용 실패";
        alert(`데이터 적용 중 오류가 발생했습니다: ${message}`);
      } finally {
        setPendingTourData(null);
      }
    },
    [
      pendingTourData,
      setTitle,
      setDescription,
      setNote,
      setInfoItems,
      setImages,
      setPendingTourData,
    ],
  );

  const getCurrentEditorData = useCallback(
    (): EditorCurrentData => ({
      title,
      description,
      note,
      info: infoItems.map((item) => ({
        title: item.title,
        content: item.content,
      })),
      imageCount: images.length,
    }),
    [title, description, note, infoItems, images],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const contentId = searchParams.get("contentId");
    const contentTypeId = searchParams.get("contentTypeId");

    if (!contentId || !contentTypeId) return;

    const loadFromUrl = async () => {
      setIsTourLoading(true);
      try {
        const detail = await getFullDetail(contentId, contentTypeId);
        const operatingInfo = extractOperatingInfo(
          detail.intro,
          contentTypeId,
        );

        const info: Array<{ title: string; content: string }> = [];

        const address = [detail.common?.addr1, detail.common?.addr2]
          .filter(Boolean)
          .join(" ")
          .trim();
        if (address) {
          info.push({ title: "장소 위치", content: address });
        }

        if (operatingInfo) {
          Object.entries(operatingInfo).forEach(([key, value]) => {
            info.push({
              title: key,
              content: String(value).replace(/<[^>]*>/g, "").trim(),
            });
          });
        }

        const tourImages = detail.images
          .filter((img) => img.originimgurl)
          .map((img) => ({
            src: img.originimgurl,
            caption: img.imgname || "",
          }));

        applyTourData({
          title: detail.common?.title || "",
          description:
            detail.common?.overview?.replace(/<[^>]*>/g, "").trim() || "",
          note: "한국관광공사 TourAPI",
          info,
          images: tourImages,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "데이터 로드 실패";
        alert(`Tour API 데이터를 불러오지 못했습니다: ${message}`);
      } finally {
        setIsTourLoading(false);
      }
    };

    loadFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    applyTourData,
    confirmApplyTourData,
    getCurrentEditorData,
  };
}
