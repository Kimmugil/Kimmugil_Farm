import { google } from "googleapis";
import type { SiteConfig, UITexts, Card, DmMessage, DmMasterConfig } from "./types";

function getAuthClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error(
      "Google API credentials are not configured. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local"
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error(
      "GOOGLE_SHEET_ID is not configured in .env.local"
    );
  }
  return id;
}

export async function getSheetsClient() {
  const auth = getAuthClient();
  return google.sheets({ version: "v4", auth });
}

export async function fetchConfig(): Promise<SiteConfig> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "CONFIG!A:B",
  });

  const rows = res.data.values ?? [];
  const map: Record<string, string> = {};
  for (const [key, value] of rows) {
    if (key) map[key] = value ?? "";
  }

  return {
    OPEN: map["OPEN"]?.toLowerCase() === "true",
    ADMIN_PASSWORD: map["ADMIN_PASSWORD"] ?? "",
    META_TITLE: map["META_TITLE"] ?? "Portfolio",
    META_DESC: map["META_DESC"] ?? "",
    SCROLL_SPEED: parseInt(map["SCROLL_SPEED"] ?? "") || 30,
    DM_ANON_NICKNAME: map["DM_ANON_NICKNAME"] ?? "익명의 농부",
    DM_LEFT_OFFSET: map["DM_LEFT_OFFSET"] ?? "20%",
    DM_RIGHT_PADDING: map["DM_RIGHT_PADDING"] ?? "10%",
  };
}

export async function fetchUITexts(): Promise<UITexts> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "UI_TEXTS!A:B",
  });

  const rows = res.data.values ?? [];
  const texts: UITexts = {};

  for (const [key, value] of rows) {
    if (key && key !== "KEY") {
      texts[key] = value ?? "";
    }
  }

  return texts;
}

export async function fetchCards(): Promise<Card[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "CARDS!A:L",
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];

  // 헤더 공백·대소문자 정규화 후 인덱스 조회
  const normalHeaders = rows[0].map((h: string) => (h ?? "").trim().toLowerCase());
  const col = (name: string) => normalHeaders.indexOf(name.trim().toLowerCase());
  const dataRows = rows.slice(1);

  const cards: Card[] = dataRows
    .map((row) => {
      const get = (i: number) => (i >= 0 ? (row[i] ?? "") : "");
      return {
        순서: parseInt(get(col("순서"))) || 0,
        온오프: get(col("온오프")).toLowerCase() === "true",
        아이콘: get(col("아이콘")),
        타이틀: get(col("타이틀")),
        서브타이틀: get(col("서브타이틀")),
        설명1: get(col("설명1")),
        설명2: get(col("설명2")),
        설명3: get(col("설명3")),
        설명4: get(col("설명4")),
        URL: get(col("url")),
        뱃지: get(col("뱃지")).trim().toUpperCase(),
        상태: get(col("상태")).trim().toUpperCase(),
      };
    })
    .filter((c) => c.온오프)
    .sort((a, b) => a.순서 - b.순서);

  return cards;
}

export async function updateSheetRange(
  sheet: string,
  range: string,
  values: string[][]
) {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheet}!${range}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function fetchDMs(maxCount = 30): Promise<DmMessage[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "DM!A:D",
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];

  const dataRows = rows.slice(1).slice(-maxCount);
  return dataRows.map((row) => ({
    nickname: row[2] ?? "알 수 없음",
    content:  row[3] ?? "",
    timestamp: row[1] ?? "",
  })).filter((m) => m.content.trim());
}

export async function fetchDmMaster(): Promise<DmMasterConfig> {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSheetId();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "DM_MASTER!A:E",
    });

    const rows = res.data.values ?? [];
    const settings: Record<string, string> = {};
    const SETTING_KEYS = new Set([
      "MAX_DMS", "REPULSION_RADIUS",
      "PET_SIZE_SCALE", "GROUND_OFFSET",
      "BUBBLE_FONT_SIZE", "BUBBLE_MAX_WIDTH",
    ]);
    let petHeaderFound = false;
    const pets: DmMasterConfig["pets"] = [];

    for (const row of rows) {
      const key = (row[0] ?? "").trim();
      if (!petHeaderFound) {
        if (SETTING_KEYS.has(key)) {
          settings[key] = (row[1] ?? "").trim();
        } else if (key === "EMOJI") {
          petHeaderFound = true;
        }
      } else {
        if (!key) continue;
        const fixedMsg = (row[4] ?? "").trim();
        pets.push({
          id: pets.length + 1,
          emoji: key,
          size: parseFloat(row[1] ?? "1") || 1,
          speed: parseFloat(row[2] ?? "50") || 50,
          active: (row[3] ?? "true").toLowerCase() !== "false",
          ...(fixedMsg ? { fixedMessage: fixedMsg } : {}),
        });
      }
    }

    return {
      maxDms:         parseInt(settings["MAX_DMS"]          ?? "10")  || 10,
      repulsionRadius:parseInt(settings["REPULSION_RADIUS"] ?? "70")  || 70,
      petSizeScale:   parseFloat(settings["PET_SIZE_SCALE"] ?? "0.7") || 0.7,
      groundOffset:   parseInt(settings["GROUND_OFFSET"]    ?? "8")   || 8,
      bubbleFontSize: parseInt(settings["BUBBLE_FONT_SIZE"] ?? "12")  || 12,
      bubbleMaxWidth: parseInt(settings["BUBBLE_MAX_WIDTH"] ?? "160") || 160,
      pets,
    };
  } catch {
    return {
      maxDms: 10, repulsionRadius: 70,
      petSizeScale: 0.7, groundOffset: 8,
      bubbleFontSize: 12, bubbleMaxWidth: 160,
      pets: [],
    };
  }
}

export async function appendDM(
  nickname: string,
  content: string,
  anonNickname: string
): Promise<DmMessage> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSheetId();

  const uuid = crypto.randomUUID();
  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const finalNickname = nickname.trim()
    ? nickname.trim()
    : `${anonNickname}#${Math.floor(Math.random() * 9000 + 1000)}`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "DM!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[uuid, timestamp, finalNickname, content]] },
  });

  return { nickname: finalNickname, content, timestamp };
}
