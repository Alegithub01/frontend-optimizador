type TranslationKey =
  | "enter"
  | "lets_go"
  | "video_tutorial"
  | "video_not_available"
  | "tutorial_uso"
  | "descargar"
  | "camara"
  | "video"
  | "start_adventure"
  | "recommend_mobile_ar"


const languageTranslations: Record<string, Record<TranslationKey, string>> = {
  ES: {
    enter: "Ingresar",
    lets_go: "¡VAMOS!",
    video_tutorial: "VIDEO TUTORIAL",
    video_not_available: "Video no disponible",
    tutorial_uso: "Tutorial de cómo usar la plataforma",
    descargar: "Descargar",
    camara: "Cámara",
    video: "Video",
    start_adventure: "Aquí comienza tu aventura", // Traducción en español
    recommend_mobile_ar:
      "Te recomendamos que ingreses a través de un celular para la experiencia de realidad aumentada", // Traducción en español
  
  },
  EN: {
    enter: "Enter",
    lets_go: "LET'S GO!",
    video_tutorial: "VIDEO TUTORIAL",
    video_not_available: "Video not available",
    tutorial_uso: "Tutorial on how to use the platform",
    descargar: "Download",
    camara: "Camera",
    video: "Video",
    start_adventure: "Here begins your adventure", // Traducción en inglés
    recommend_mobile_ar: "We recommend you access via a mobile phone for the augmented reality experience", // Traducción en inglés
 
  },
  RU: {
    enter: "Войти",
    lets_go: "ПОЕХАЛИ!",
    video_tutorial: "ВИДЕО УРОК",
    video_not_available: "Видео недоступно",
    tutorial_uso: "Руководство по использованию платформы",
    descargar: "Скачать",
    camara: "Камера",
    video: "Видео",
    start_adventure: "Здесь начинается ваше приключение", // Traducción en ruso
    recommend_mobile_ar: "Рекомендуем заходить с мобильного телефона для получения опыта дополненной реальности", // Traducción en ruso
 
  },
  ZH: {
    enter: "进入",
    lets_go: "开始吧！",
    video_tutorial: "视频教程",
    video_not_available: "视频不可用",
    tutorial_uso: "如何使用该平台的教程",
    descargar: "下载",
    camara: "相机",
    video: "视频",
    start_adventure: "你的冒险从这里开始", // Traducción en chino
    recommend_mobile_ar: "建议您通过手机访问以获得增强现实体验", // Traducción en chino

  },
  JA: {
    enter: "入る",
    lets_go: "さあ行こう！",
    video_tutorial: "ビデオチュートリアル",
    video_not_available: "ビデオは利用できません",
    tutorial_uso: "プラットフォームの使い方チュートリアル",
    descargar: "ダウンロード",
    camara: "カメラ",
    video: "ビデオ",
    start_adventure: "ここからあなたの冒険が始まります", // Traducción en japonés
    recommend_mobile_ar: "拡張現実体験のために携帯電話からアクセスすることをお勧めします", // 
  },
  KO: {
    enter: "입장",
    lets_go: "가자!",
    video_tutorial: "비디오 튜토리얼",
    video_not_available: "비디오를 사용할 수 없습니다",
    tutorial_uso: "플랫폼 사용 방법 튜토리얼",
    descargar: "다운로드",
    camara: "카메라",
    video: "비디오",
    start_adventure: "여기서 당신의 모험이 시작됩니다", // Traducción en coreano
    recommend_mobile_ar: "증강 현실 경험을 위해 휴대폰으로 접속하는 것을 권장합니다", // 
  },
}

const countryToLanguage: Record<string, string> = {
  // Español
  AR: "ES", BO: "ES", CL: "ES", CO: "ES", CR: "ES", CU: "ES",
  DO: "ES", EC: "ES", SV: "ES", GT: "ES", HN: "ES", MX: "ES",
  NI: "ES", PA: "ES", PY: "ES", PE: "ES", PR: "ES", ES: "ES",
  UY: "ES", VE: "ES",
  // Inglés
  US: "EN", GB: "EN", CA: "EN", AU: "EN", NZ: "EN", IE: "EN", ZA: "EN",
  // Ruso
  RU: "RU", BY: "RU", KZ: "RU", UA: "RU",
  // Chino
  CN: "ZH", TW: "ZH", HK: "ZH", SG: "ZH", MO: "ZH",
  // Japonés
  JP: "JA",
  // Coreano
  KR: "KO",
}

export function getTranslation(countryCode: string, key: TranslationKey): string {
  const upperCountryCode = countryCode.toUpperCase()
  const langCode = countryToLanguage[upperCountryCode] || "ES"
  const translations = languageTranslations[langCode] || languageTranslations["ES"]
  return translations[key] || key
}
