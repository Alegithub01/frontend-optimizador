// lib/translations.ts

type TranslationKey = "enter" | "lets_go" | "video_tutorial"

const languageTranslations: Record<string, Record<TranslationKey, string>> = {
  ES: {
    enter: "Ingresar",
    lets_go: "¡VAMOS!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  EN: {
    enter: "Enter",
    lets_go: "LET'S GO!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  RU: {
    enter: "Войти",
    lets_go: "ПОЕХАЛИ!",
    video_tutorial: "ВИДЕО УРОК",
  },
  ZH: {
    enter: "进入",
    lets_go: "开始吧！",
    video_tutorial: "视频教程",
  },
  JA: {
    enter: "入る",
    lets_go: "さあ行こう！",
    video_tutorial: "ビデオチュートリアル",
  },
  KO: {
    enter: "입장",
    lets_go: "가자!",
    video_tutorial: "비디오 튜토리얼",
  },
}

const countryToLanguage: Record<string, string> = {
  // Español
  AR: "ES", BO: "ES", CL: "ES", CO: "ES", CR: "ES", CU: "ES", DO: "ES", EC: "ES",
  SV: "ES", GT: "ES", HN: "ES", MX: "ES", NI: "ES", PA: "ES", PY: "ES", PE: "ES",
  PR: "ES", ES: "ES", UY: "ES", VE: "ES",

  // Inglés
  US: "EN", GB: "EN", CA: "EN", AU: "EN", NZ: "EN", IE: "EN", ZA: "EN",

  // Ruso
  RU: "RU", BY: "RU", KZ: "RU", UA: "RU",

  // Chino (Mandarín)
  CN: "ZH", TW: "ZH", HK: "ZH", SG: "ZH", MO: "ZH",

  // Japonés
  JP: "JA",

  // Coreano
  KR: "KO",
}

export function getTranslation(countryCode: string, key: TranslationKey): string {
  const upperCountryCode = countryCode.toUpperCase()
  const langCode = countryToLanguage[upperCountryCode] || "ES" // fallback a Español
  const translations = languageTranslations[langCode] || languageTranslations["ES"]
  return translations[key] || key
}
