export interface SiteConfig {
  OPEN: boolean;
  ADMIN_PASSWORD: string;
  META_TITLE: string;
  META_DESC: string;
  SCROLL_SPEED: number;
  DM_ANON_NICKNAME: string;
  DM_LEFT_OFFSET: string;
  DM_RIGHT_PADDING: string;
}

export interface DmPet {
  id: number;
  uuid: string;    // DM_MASTER E열: 펫 고유 식별자
  emoji: string;
  size: number;    // 1.0 = base (~22px)
  speed: number;  // px/s
  active: boolean;
}

export interface DmMasterConfig {
  maxDms: number;
  repulsionRadius: number;
  petSizeScale: number;   // 이모지 font-size = pet.size * petSizeScale (rem)
  groundOffset: number;   // 바닥에서 위로 띄우는 px (클리핑 방지)
  bubbleFontSize: number; // 말풍선 내용 폰트 크기 (px)
  bubbleMaxWidth: number; // 말풍선 최대 너비 (px)
  pets: DmPet[];
}

export interface DmMessage {
  nickname: string;
  content: string;
  timestamp: string;
  petUuid?: string; // DM 시트 E열: 배정할 펫 UUID (비우면 자동 분배)
}

export interface UITexts {
  [key: string]: string;
}

export interface Card {
  순서: number;
  온오프: boolean;
  아이콘: string;
  타이틀: string;
  서브타이틀: string;
  설명1: string;
  설명2: string;
  설명3: string;
  설명4: string;
  URL: string;
  뱃지: string;
  상태: string;
}

export interface SheetUpdatePayload {
  sheet: "UI_TEXTS" | "CARDS" | "CONFIG";
  range: string;
  values: string[][];
}
