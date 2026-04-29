export interface SiteConfig {
  OPEN: boolean;
  ADMIN_PASSWORD: string;
  META_TITLE: string;
  META_DESC: string;
  SCROLL_SPEED: number;
  DM_ANON_NICKNAME: string;
}

export interface DmMessage {
  nickname: string;
  content: string;
  timestamp: string;
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
