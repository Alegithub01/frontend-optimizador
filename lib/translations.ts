// lib/translations.ts

type TranslationKey = "enter" | "lets_go" | "video_tutorial"

const translations: Record<string, Record<TranslationKey, string>> = {
  ES: {
    // Spanish (default for many Latin American countries)
    enter: "Ingresar",
    lets_go: "¡VAMOS!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  AR: {
    // Argentina (example, can be same as ES or specific)
    enter: "Ingresar",
    lets_go: "¡VAMOS!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  BO: {
    // Bolivia (example)
    enter: "Ingresar",
    lets_go: "¡VAMOS!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  US: {
    // United States
    enter: "Enter",
    lets_go: "LET'S GO!",
    video_tutorial: "VIDEO TUTORIAL",
  },
  RU: {
    // Russia
    enter: "Войти", // Voyti
    lets_go: "ПОЕХАЛИ!", // Poyekhali
    video_tutorial: "ВИДЕО УРОК", // Video Urok
  },
  // Add more country codes and their translations as needed
}

export function getTranslation(countryCode: string, key: TranslationKey): string {
  const upperCaseCode = countryCode.toUpperCase()
  const countryTranslations = translations[upperCaseCode] || translations["ES"] // Fallback to Spanish
  return countryTranslations[key] || key // Fallback to key itself if translation not found
}
