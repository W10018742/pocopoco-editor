"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  ArrowRight,
  Check,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { TourApplyData } from "./TourSearchPanel";

export interface DiffSelections {
  title: "current" | "incoming";
  description: "current" | "incoming";
  note: "current" | "incoming";
  info: "current" | "incoming" | "merge";
  images: "skip" | "add";
}

export interface EditorCurrentData {
  title: string;
  description: string;
  note: string;
  info: Array<{ title: string; content: string }>;
  imageCount: number;
}

interface TourApplyDiffModalProps {
  onClose: () => void;
  onConfirm: (selections: DiffSelections) => void;
  currentData: EditorCurrentData;
  incomingData: TourApplyData;
}

type TextFieldKey = "title" | "description" | "note";

interface FieldDiffState {
  hasChange: boolean;
  currentEmpty: boolean;
}

function getFieldDiff(current: string, incoming: string): FieldDiffState {
  const currentTrimmed = current.trim();
  const incomingTrimmed = incoming.trim();
  return {
    hasChange: currentTrimmed !== incomingTrimmed,
    currentEmpty: currentTrimmed === "",
  };
}

function getInfoDiff(
  current: Array<{ title: string; content: string }>,
  incoming: Array<{ title: string; content: string }>,
): FieldDiffState {
  const currentStr = current.map((i) => `${i.title}:${i.content}`).join("|");
  const incomingStr = incoming.map((i) => `${i.title}:${i.content}`).join("|");
  const currentEmpty =
    current.length === 0 ||
    (current.length === 1 && !current[0].title && !current[0].content);
  return {
    hasChange: currentStr !== incomingStr,
    currentEmpty,
  };
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

const FIELD_LABELS: Record<TextFieldKey, string> = {
  title: "제목",
  description: "설명",
  note: "노트",
};

export default function TourApplyDiffModal({
  onClose,
  onConfirm,
  currentData,
  incomingData,
}: TourApplyDiffModalProps) {
  const [selections, setSelections] = useState<DiffSelections>({
    title: "incoming",
    description: "incoming",
    note: "incoming",
    info: "incoming",
    images: "add",
  });

  const diffs = useMemo(() => {
    return {
      title: getFieldDiff(currentData.title, incomingData.title),
      description: getFieldDiff(
        currentData.description,
        incomingData.description,
      ),
      note: getFieldDiff(currentData.note, incomingData.note),
      info: getInfoDiff(currentData.info, incomingData.info),
    };
  }, [currentData, incomingData]);

  const handleSelect = (
    field: keyof DiffSelections,
    value: DiffSelections[keyof DiffSelections],
  ) => {
    setSelections((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = useCallback(() => {
    onConfirm(selections);
  }, [onConfirm, selections]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const textFields: TextFieldKey[] = ["title", "description", "note"];

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[720px] max-h-[85vh] bg-surface-secondary rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-surface border-b border-edge">
          <h3 className="m-0 text-base font-semibold text-emerald-400 flex items-center gap-2">
            <ArrowRight size={16} />
            데이터 적용 확인
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border-none bg-surface-card text-content cursor-pointer flex items-center justify-center"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Text Fields */}
          {textFields.map((field) => {
            const diff = diffs[field];
            const currentValue = currentData[field];
            const incomingValue = incomingData[field];

            if (!diff.hasChange) {
              return (
                <DiffRow
                  key={field}
                  label={FIELD_LABELS[field]}
                  status="unchanged"
                >
                  <div className="text-xs text-content-secondary italic">
                    변경 없음
                    {currentValue && (
                      <span className="ml-2 text-content-secondary">
                        ({truncateText(currentValue, 40)})
                      </span>
                    )}
                  </div>
                </DiffRow>
              );
            }

            if (diff.currentEmpty) {
              return (
                <DiffRow key={field} label={FIELD_LABELS[field]} status="auto">
                  <div className="text-xs text-emerald-400/70">
                    자동 적용 (현재 비어있음)
                  </div>
                  <ExpandableText
                    text={incomingValue}
                    maxLen={200}
                    className="mt-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-content leading-relaxed"
                  />
                </DiffRow>
              );
            }

            return (
              <DiffRow
                key={field}
                label={FIELD_LABELS[field]}
                status="changed"
                selection={selections[field]}
                onSelect={(value) =>
                  handleSelect(field, value as "current" | "incoming")
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <DiffCard
                    label="현재"
                    text={currentValue}
                    isSelected={selections[field] === "current"}
                    onClick={() => handleSelect(field, "current")}
                    variant="current"
                  />
                  <DiffCard
                    label="Tour API"
                    text={incomingValue}
                    isSelected={selections[field] === "incoming"}
                    onClick={() => handleSelect(field, "incoming")}
                    variant="incoming"
                  />
                </div>
              </DiffRow>
            );
          })}

          {/* Info Items */}
          <InfoDiffSection
            diff={diffs.info}
            currentInfo={currentData.info}
            incomingInfo={incomingData.info}
            selection={selections.info}
            onSelect={(value) =>
              handleSelect("info", value as "current" | "incoming" | "merge")
            }
          />

          {/* Images */}
          {incomingData.images.length > 0 && (
            <DiffRow
              label={`이미지 (${incomingData.images.length}장)`}
              status="changed"
              selection={selections.images}
              onSelect={(value) =>
                handleSelect("images", value as "skip" | "add")
              }
              toggleLabels={["추가 안 함", "풀에 추가"]}
              toggleValues={["skip", "add"]}
            >
              <div className="flex items-center gap-3 mb-2">
                {currentData.imageCount > 0 && (
                  <span className="text-[10px] text-content-secondary">
                    현재 이미지 풀: {currentData.imageCount}장
                  </span>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {incomingData.images.slice(0, 8).map((img: { src: string; caption: string }, idx: number) => (
                  <div
                    key={idx}
                    className={`w-14 h-14 rounded-md overflow-hidden shrink-0 transition-opacity ${
                      selections.images === "skip" ? "opacity-40" : ""
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {incomingData.images.length > 8 && (
                  <div className="w-14 h-14 rounded-md bg-surface-card flex items-center justify-center shrink-0 text-[10px] text-content-secondary">
                    +{incomingData.images.length - 8}
                  </div>
                )}
              </div>
            </DiffRow>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 bg-surface border-t border-edge">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border-none bg-gray-500 text-white font-semibold cursor-pointer text-sm"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-lg border-none bg-emerald-500 text-white font-semibold cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <Check size={14} />
            선택 항목 적용
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

interface InfoDiffSectionProps {
  diff: FieldDiffState;
  currentInfo: Array<{ title: string; content: string }>;
  incomingInfo: Array<{ title: string; content: string }>;
  selection: "current" | "incoming" | "merge";
  onSelect: (value: string) => void;
}

function InfoDiffSection({
  diff,
  currentInfo,
  incomingInfo,
  selection,
  onSelect,
}: InfoDiffSectionProps) {
  if (!diff.hasChange) {
    return (
      <DiffRow label="관람 정보" status="unchanged">
        <div className="text-xs text-content-secondary italic">변경 없음</div>
      </DiffRow>
    );
  }

  if (diff.currentEmpty) {
    return (
      <DiffRow label="관람 정보" status="auto">
        <div className="text-xs text-emerald-400/70 mb-1.5">
          자동 적용 (현재 비어있음)
        </div>
        <ExpandableInfoList items={incomingInfo} />
      </DiffRow>
    );
  }

  const mergedItems = [
    ...currentInfo,
    ...incomingInfo.filter(
      (inc) =>
        !currentInfo.some(
          (cur) => cur.title === inc.title && cur.content === inc.content,
        ),
    ),
  ];

  return (
    <DiffRow
      label="관람 정보"
      status="changed"
      selection={selection}
      onSelect={onSelect}
      toggleLabels={["현재 유지", "새 값 적용", "모든 값 넣기"]}
      toggleValues={["current", "incoming", "merge"]}
    >
      <div className="grid grid-cols-2 gap-2">
        <InfoCard
          label={`현재 (${currentInfo.length}개)`}
          items={currentInfo}
          isSelected={selection === "current"}
          onClick={() => onSelect("current")}
          variant="current"
        />
        <InfoCard
          label={`Tour API (${incomingInfo.length}개)`}
          items={incomingInfo}
          isSelected={selection === "incoming"}
          onClick={() => onSelect("incoming")}
          variant="incoming"
        />
      </div>
      {selection === "merge" && (
        <div className="mt-2 p-2 rounded-lg border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Check size={12} className="text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium">
              합친 결과 ({mergedItems.length}개)
            </span>
          </div>
          <div className="space-y-1">
            {mergedItems.map((item, idx) => (
              <div key={idx} className="text-[11px] text-content">
                <span className="text-amber-500/70">{item.title}:</span>{" "}
                {truncateText(item.content, 50)}
              </div>
            ))}
          </div>
        </div>
      )}
    </DiffRow>
  );
}

interface InfoCardProps {
  label: string;
  items: Array<{ title: string; content: string }>;
  isSelected: boolean;
  onClick: () => void;
  variant: "current" | "incoming";
}

const INFO_PREVIEW_COUNT = 3;
const INFO_CONTENT_TRUNCATE_LEN = 30;

function InfoCard({
  label,
  items,
  isSelected,
  onClick,
  variant,
}: InfoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > INFO_PREVIEW_COUNT;
  const hasLongContent = items.some(
    (item) => item.content.length > INFO_CONTENT_TRUNCATE_LEN,
  );
  const canExpand = hasMore || hasLongContent;
  const selectedBorder =
    variant === "current" ? "border-violet-500" : "border-emerald-500";
  const selectedBg =
    variant === "current" ? "bg-violet-500/10" : "bg-emerald-500/10";
  const checkColor =
    variant === "current" ? "text-violet-400" : "text-emerald-400";

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const visibleItems = expanded ? items : items.slice(0, INFO_PREVIEW_COUNT);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? `${selectedBorder} ${selectedBg}`
          : "border-edge bg-surface-card/50 hover:border-content-secondary"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-content-secondary font-medium">{label}</span>
        {isSelected && <Check size={12} className={checkColor} />}
      </div>
      <div className="space-y-1">
        {visibleItems.map((item, idx) => (
          <div key={idx} className="text-[11px] text-content">
            <span className="text-amber-500/70">{item.title}:</span>{" "}
            {expanded
              ? item.content
              : truncateText(item.content, INFO_CONTENT_TRUNCATE_LEN)}
          </div>
        ))}
        {!expanded && hasMore && (
          <div className="text-[10px] text-content-secondary">
            +{items.length - INFO_PREVIEW_COUNT}개 더
          </div>
        )}
      </div>
      {canExpand && (
        <button
          onClick={handleToggleExpand}
          className="mt-1.5 flex items-center gap-0.5 text-[10px] text-content-secondary hover:text-content bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          {expanded ? (
            <>
              접기 <ChevronUp size={10} />
            </>
          ) : (
            <>
              전체 보기 <ChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface ExpandableTextProps {
  text: string;
  maxLen: number;
  className?: string;
}

function ExpandableText({ text, maxLen, className = "" }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = text.length > maxLen;

  return (
    <div className={className}>
      <p className="m-0 whitespace-pre-wrap">
        {expanded ? text : truncateText(text, maxLen)}
      </p>
      {isTruncated && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 flex items-center gap-0.5 text-[10px] text-content-secondary hover:text-content bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          {expanded ? (
            <>
              접기 <ChevronUp size={10} />
            </>
          ) : (
            <>
              전체 보기 <ChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

const AUTO_INFO_PREVIEW_COUNT = 4;
const AUTO_INFO_CONTENT_TRUNCATE_LEN = 60;

interface ExpandableInfoListProps {
  items: Array<{ title: string; content: string }>;
}

function ExpandableInfoList({ items }: ExpandableInfoListProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = items.length > AUTO_INFO_PREVIEW_COUNT;
  const hasLongContent = items.some(
    (item) => item.content.length > AUTO_INFO_CONTENT_TRUNCATE_LEN,
  );
  const canExpand = hasMore || hasLongContent;
  const visibleItems = expanded
    ? items
    : items.slice(0, AUTO_INFO_PREVIEW_COUNT);

  return (
    <div>
      <div className="space-y-1">
        {visibleItems.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-2 text-xs p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded"
          >
            <span className="text-amber-500 font-medium w-16 shrink-0">
              {item.title}
            </span>
            <span className="text-content">
              {expanded
                ? item.content
                : truncateText(item.content, AUTO_INFO_CONTENT_TRUNCATE_LEN)}
            </span>
          </div>
        ))}
      </div>
      {canExpand && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1.5 flex items-center gap-0.5 text-[10px] text-content-secondary hover:text-content bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          {expanded ? (
            <>
              접기 <ChevronUp size={10} />
            </>
          ) : (
            <>
              전체 보기
              {hasMore &&
                ` (+${items.length - AUTO_INFO_PREVIEW_COUNT}개)`}{" "}
              <ChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface DiffRowProps {
  label: string;
  status: "unchanged" | "changed" | "auto";
  selection?: string;
  onSelect?: (value: string) => void;
  toggleLabels?: string[];
  toggleValues?: string[];
  children: React.ReactNode;
}

function DiffRow({
  label,
  status,
  selection,
  onSelect,
  toggleLabels = ["현재 유지", "새 값 적용"],
  toggleValues = ["current", "incoming"],
  children,
}: DiffRowProps) {
  return (
    <div className="bg-surface-card/30 rounded-lg p-3 border border-edge/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-content">{label}</span>
          {status === "unchanged" && (
            <Minus size={12} className="text-content-secondary" />
          )}
          {status === "auto" && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
              자동
            </span>
          )}
        </div>
        {status === "changed" && onSelect && (
          <div className="flex bg-surface-card rounded-md overflow-hidden border border-edge">
            {toggleValues.map((val, idx) => {
              const activeColors = [
                "bg-violet-500/30 text-violet-300",
                "bg-emerald-500/30 text-emerald-300",
                "bg-amber-500/30 text-amber-300",
              ];
              return (
                <button
                  key={val}
                  onClick={() => onSelect(val)}
                  className={`px-2.5 py-1 text-[11px] font-medium border-none cursor-pointer transition-colors ${
                    selection === val
                      ? activeColors[idx] || activeColors[1]
                      : "bg-transparent text-content-secondary hover:text-content"
                  }`}
                >
                  {toggleLabels[idx]}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

const TEXT_TRUNCATE_LEN = 120;

interface DiffCardProps {
  label: string;
  text: string;
  isSelected: boolean;
  onClick: () => void;
  variant: "current" | "incoming";
}

function DiffCard({
  label,
  text,
  isSelected,
  onClick,
  variant,
}: DiffCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = text.length > TEXT_TRUNCATE_LEN;
  const selectedBorder =
    variant === "current" ? "border-violet-500" : "border-emerald-500";
  const selectedBg =
    variant === "current" ? "bg-violet-500/10" : "bg-emerald-500/10";
  const checkColor =
    variant === "current" ? "text-violet-400" : "text-emerald-400";

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? `${selectedBorder} ${selectedBg}`
          : "border-edge bg-surface-card/50 hover:border-content-secondary"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-content-secondary font-medium">{label}</span>
        {isSelected && <Check size={12} className={checkColor} />}
      </div>
      <p className="m-0 text-xs text-content leading-relaxed whitespace-pre-wrap">
        {expanded ? text : truncateText(text, TEXT_TRUNCATE_LEN)}
      </p>
      {isTruncated && (
        <button
          onClick={handleToggleExpand}
          className="mt-1.5 flex items-center gap-0.5 text-[10px] text-content-secondary hover:text-content bg-transparent border-none cursor-pointer p-0 transition-colors"
        >
          {expanded ? (
            <>
              접기 <ChevronUp size={10} />
            </>
          ) : (
            <>
              전체 보기 <ChevronDown size={10} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
