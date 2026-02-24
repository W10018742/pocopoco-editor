import { getApiKey } from "../services/apiKeyManager";

// TourAPI 응답 타입
export interface TourItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  tel?: string;
  firstimage?: string;
  firstimage2?: string;
  mapx?: string;
  mapy?: string;
  mlevel?: string;
  areacode?: string;
  sigungucode?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  createdtime?: string;
  modifiedtime?: string;
}

export interface DetailCommon {
  contentid: string;
  contenttypeid: string;
  title: string;
  overview?: string;
  homepage?: string;
  tel?: string;
  telname?: string;
  addr1?: string;
  addr2?: string;
  zipcode?: string;
  firstimage?: string;
  firstimage2?: string;
}

export interface DetailIntro {
  contentid: string;
  contenttypeid: string;
  // 관광지 (12)
  infocenter?: string;
  opendate?: string;
  restdate?: string;
  usetime?: string;
  parking?: string;
  // 문화시설 (14)
  infocenterculture?: string;
  usefee?: string;
  usetimeculture?: string;
  restdateculture?: string;
  parkingculture?: string;
  parkingfee?: string;
  // 축제/행사 (15)
  eventstartdate?: string;
  eventenddate?: string;
  playtime?: string;
  eventplace?: string;
  // 공통
  chkbabycarriage?: string;
  chkcreditcard?: string;
  chkpet?: string;
}

export interface ImageItem {
  contentid: string;
  originimgurl: string;
  imgname?: string;
  smallimageurl?: string;
  cpyrhtDivCd?: string;
  serialnum?: string;
}

const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

// API 호출 함수
export async function callTourAPI(
  endpoint: string,
  params: Record<string, string> = {},
) {
  const serviceKey = getApiKey("tour_api_key");
  if (!serviceKey) {
    throw new Error("Tour API 키가 설정되지 않았습니다. 설정에서 입력해주세요.");
  }

  const searchParams = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "PocoPocoEditor",
    _type: "json",
    ...params,
  });

  const response = await fetch(
    `${BASE_URL}/${endpoint}?serviceKey=${serviceKey}&${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const data = await response.json();

  const header = data?.response?.header;
  if (header && header.resultCode !== "0000" && header.resultCode !== "00") {
    throw new Error(`API 오류: ${header.resultMsg || header.resultCode}`);
  }

  return data;
}

// 키워드 검색
export async function searchKeyword(
  keyword: string,
  pageNo: number = 1,
  numOfRows: number = 20,
) {
  const data = await callTourAPI("searchKeyword2", {
    keyword,
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    arrange: "A", // 제목순
  });

  const items = data?.response?.body?.items?.item;
  const totalCount = data?.response?.body?.totalCount || 0;

  return {
    items: Array.isArray(items) ? items : items ? [items] : [],
    totalCount: Number(totalCount),
  };
}

// 공통 정보 조회
export async function getDetailCommon(
  contentId: string,
): Promise<DetailCommon | null> {
  const data = await callTourAPI("detailCommon2", {
    contentId,
  });

  const item = data?.response?.body?.items?.item;
  return Array.isArray(item) ? item[0] : item || null;
}

// 소개 정보 조회 (운영시간, 휴무일 등)
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string,
): Promise<DetailIntro | null> {
  const data = await callTourAPI("detailIntro2", {
    contentId,
    contentTypeId,
  });

  const item = data?.response?.body?.items?.item;
  return Array.isArray(item) ? item[0] : item || null;
}

// 이미지 목록 조회
export async function getDetailImages(contentId: string): Promise<ImageItem[]> {
  const data = await callTourAPI("detailImage2", {
    contentId,
  });

  const items = data?.response?.body?.items?.item;
  return Array.isArray(items) ? items : items ? [items] : [];
}

// 전체 상세 정보 조회
export async function getFullDetail(contentId: string, contentTypeId: string) {
  const [common, intro, images] = await Promise.all([
    getDetailCommon(contentId),
    getDetailIntro(contentId, contentTypeId),
    getDetailImages(contentId),
  ]);

  return { common, intro, images };
}

// 콘텐츠 타입 ID → 이름 변환
export const CONTENT_TYPE_MAP: Record<string, string> = {
  "12": "관광지",
  "14": "문화시설",
  "15": "축제/행사",
  "25": "여행코스",
  "28": "레포츠",
  "32": "숙박",
  "38": "쇼핑",
  "39": "음식점",
};

export function getContentTypeName(typeId: string): string {
  return CONTENT_TYPE_MAP[typeId] || `기타(${typeId})`;
}

// 운영 정보 추출 (contentTypeId에 따라 다른 필드 사용)
export function extractOperatingInfo(
  intro: DetailIntro | null,
  contentTypeId: string,
) {
  if (!intro) return null;

  const info: Record<string, string> = {};

  if (contentTypeId === "12") {
    // 관광지
    if (intro.usetime) info["운영시간"] = intro.usetime;
    if (intro.restdate) info["휴무일"] = intro.restdate;
    if (intro.infocenter) info["문의처"] = intro.infocenter;
    if (intro.parking) info["주차"] = intro.parking;
  } else if (contentTypeId === "14") {
    // 문화시설
    if (intro.usetimeculture) info["운영시간"] = intro.usetimeculture;
    if (intro.restdateculture) info["휴무일"] = intro.restdateculture;
    if (intro.usefee) info["이용요금"] = intro.usefee;
    if (intro.infocenterculture) info["문의처"] = intro.infocenterculture;
    if (intro.parkingculture) info["주차"] = intro.parkingculture;
    if (intro.parkingfee) info["주차요금"] = intro.parkingfee;
  } else if (contentTypeId === "15") {
    // 축제/행사
    if (intro.eventstartdate) info["시작일"] = intro.eventstartdate;
    if (intro.eventenddate) info["종료일"] = intro.eventenddate;
    if (intro.playtime) info["행사시간"] = intro.playtime;
    if (intro.eventplace) info["장소"] = intro.eventplace;
  }

  // 공통
  if (intro.chkbabycarriage) info["유모차대여"] = intro.chkbabycarriage;
  if (intro.chkcreditcard) info["신용카드"] = intro.chkcreditcard;
  if (intro.chkpet) info["반려동물"] = intro.chkpet;

  return Object.keys(info).length > 0 ? info : null;
}

// 최종 JSON 포맷으로 변환
export function formatToTargetJSON(
  common: DetailCommon | null,
  intro: DetailIntro | null,
  images: ImageItem[],
  contentTypeId: string,
) {
  const operatingInfo = extractOperatingInfo(intro, contentTypeId);

  const infoArray = operatingInfo
    ? Object.entries(operatingInfo).map(([key, value]) => ({
        INFO_TITLE: key,
        CONTENT: value.replace(/<[^>]*>/g, "").trim(), // HTML 태그 제거
      }))
    : [];

  return {
    TITLE: common?.title || "",
    DESCRIPTION: common?.overview?.replace(/<[^>]*>/g, "").trim() || "",
    NOTE: "한국관광공사 TourAPI",
    INFO: infoArray,
    INNER_IMAGES: images.map((img) => img.originimgurl).filter(Boolean),
    _meta: {
      contentId: common?.contentid,
      contentTypeId,
      address: [common?.addr1, common?.addr2].filter(Boolean).join(" "),
      tel: common?.tel,
      homepage: common?.homepage,
      firstImage: common?.firstimage,
    },
  };
}
