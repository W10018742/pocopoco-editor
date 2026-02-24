"use client";

import React, { useState, useCallback } from "react";
import {
  Search,
  MapPin,
  Loader2,
  X,
  ChevronLeft,
  Image,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  searchKeyword,
  getFullDetail,
  getContentTypeName,
  extractOperatingInfo,
  type TourItem,
  type DetailCommon,
  type DetailIntro,
  type ImageItem,
} from "../lib/tourapi";

export interface TourApplyData {
  title: string;
  description: string;
  note: string;
  info: Array<{ title: string; content: string }>;
  images: Array<{ src: string; caption: string }>;
}

interface TourSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: TourApplyData) => void;
}

export default function TourSearchPanel({
  isOpen,
  onClose,
  onApply,
}: TourSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<TourItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<TourItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailData, setDetailData] = useState<{
    common: DetailCommon | null;
    intro: DetailIntro | null;
    images: ImageItem[];
  } | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSelectedItem(null);
    setDetailData(null);

    try {
      const { items, totalCount: count } = await searchKeyword(
        searchQuery.trim(),
      );
      setSearchResults(items);
      setTotalCount(count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "검색 중 오류가 발생했습니다.",
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const loadDetail = async (item: TourItem) => {
    setSelectedItem(item);
    setIsLoadingDetail(true);
    setError(null);

    try {
      const data = await getFullDetail(item.contentid, item.contenttypeid);
      setDetailData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "상세 정보 조회 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleApply = () => {
    if (!detailData || !selectedItem) return;

    const operatingInfo = extractOperatingInfo(
      detailData.intro,
      selectedItem.contenttypeid,
    );

    const info: Array<{ title: string; content: string }> = [];

    // 장소 위치 정보 추가 (detailCommon에 없으면 검색결과에서 가져옴)
    const address = [
      detailData.common?.addr1 || selectedItem.addr1,
      detailData.common?.addr2 || selectedItem.addr2,
    ]
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

    const images = detailData.images
      .filter((img) => img.originimgurl)
      .map((img) => ({
        src: img.originimgurl,
        caption: img.imgname || "",
      }));

    const applyData: TourApplyData = {
      title: detailData.common?.title || selectedItem.title,
      description:
        detailData.common?.overview?.replace(/<[^>]*>/g, "").trim() || "",
      note: "한국관광공사 TourAPI",
      info,
      images,
    };

    onApply(applyData);
    onClose();
  };

  const handleBackToList = () => {
    setSelectedItem(null);
    setDetailData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-[420px] max-w-full bg-surface border-l border-edge flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary border-b border-edge">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-content">
              Tour API 검색
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-surface-card text-content-secondary hover:text-content transition-colors cursor-pointer border-none"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3 border-b border-edge/50">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="장소명 검색..."
              className="w-full pl-9 pr-16 py-2.5 bg-surface-secondary border border-edge rounded-lg text-sm text-content placeholder-content-secondary focus:border-emerald-500/50 transition-colors box-border"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-md hover:bg-emerald-500/30 transition-colors disabled:opacity-50 cursor-pointer border-none"
            >
              {isSearching ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                "검색"
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedItem && detailData ? (
            /* Detail View */
            <div className="p-4">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-xs text-content-secondary hover:text-content transition-colors mb-3 cursor-pointer bg-transparent border-none p-0"
              >
                <ChevronLeft size={14} />
                목록으로
              </button>

              {/* Title */}
              <div className="mb-4">
                <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] mb-1.5">
                  {getContentTypeName(selectedItem.contenttypeid)}
                </span>
                <h3 className="text-base font-semibold text-content m-0">
                  {detailData.common?.title || selectedItem.title}
                </h3>
                {detailData.common?.addr1 && (
                  <p className="text-xs text-content-secondary mt-1 flex items-center gap-1 m-0">
                    <MapPin size={10} />
                    {[detailData.common.addr1, detailData.common.addr2]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                )}
              </div>

              {/* Description Preview */}
              {detailData.common?.overview && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-content-secondary mb-1.5 m-0">
                    설명
                  </h4>
                  <p className="text-xs text-content leading-relaxed line-clamp-4 m-0">
                    {detailData.common.overview.replace(/<[^>]*>/g, "").trim()}
                  </p>
                </div>
              )}

              {/* Operating Info */}
              {detailData.intro && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-content-secondary mb-1.5 flex items-center gap-1 m-0">
                    <Clock size={10} />
                    운영 정보
                  </h4>
                  <div className="space-y-1.5">
                    {Object.entries(
                      extractOperatingInfo(
                        detailData.intro,
                        selectedItem.contenttypeid,
                      ) || {},
                    ).map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-xs">
                        <span className="text-content-secondary w-14 shrink-0">
                          {key}
                        </span>
                        <span
                          className="text-content"
                          dangerouslySetInnerHTML={{ __html: String(value) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {detailData.images.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-content-secondary mb-1.5 flex items-center gap-1 m-0">
                    <Image size={10} />
                    이미지 ({detailData.images.length}장)
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {detailData.images.slice(0, 6).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-md overflow-hidden bg-surface-secondary"
                      >
                        <img
                          src={img.originimgurl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {detailData.images.length > 6 && (
                    <p className="text-[10px] text-content-secondary mt-1">
                      +{detailData.images.length - 6}장 더
                    </p>
                  )}
                </div>
              )}

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
              >
                <ArrowRight size={14} />
                에디터에 적용
              </button>
            </div>
          ) : isLoadingDetail ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-400 mx-auto mb-2"
                />
                <p className="text-xs text-content-secondary">상세 정보 로딩 중...</p>
              </div>
            </div>
          ) : (
            /* Search Results List */
            <div className="p-2">
              {searchResults.length > 0 && (
                <p className="text-[10px] text-content-secondary px-2 mb-2">
                  검색 결과{" "}
                  <span className="text-emerald-400">
                    {totalCount.toLocaleString()}
                  </span>
                  건
                </p>
              )}

              <div className="space-y-1">
                {searchResults.map((item) => (
                  <button
                    key={item.contentid}
                    onClick={() => loadDetail(item)}
                    className="w-full text-left p-3 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary border border-transparent hover:border-edge transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      {item.firstimage ? (
                        <img
                          src={item.firstimage}
                          alt=""
                          className="w-12 h-12 rounded-md object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-surface-card flex items-center justify-center shrink-0">
                          <Image size={14} className="text-content-secondary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-1.5 py-0.5 bg-surface-card rounded text-[9px] text-content-secondary mb-0.5">
                          {getContentTypeName(item.contenttypeid)}
                        </span>
                        <h4 className="text-sm font-medium text-content truncate m-0">
                          {item.title}
                        </h4>
                        {item.addr1 && (
                          <p className="text-[11px] text-content-secondary truncate mt-0.5 m-0">
                            {item.addr1}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {searchResults.length === 0 && !isSearching && (
                <div className="flex flex-col items-center justify-center h-64 text-content-secondary">
                  <Search size={24} className="mb-2 opacity-50" />
                  <p className="text-xs">키워드를 입력하여 검색하세요</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.25s ease-out;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
