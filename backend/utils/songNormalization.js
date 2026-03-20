/**
 * Song & game content normalization for Hebrew localization.
 * Handles: title cleaning, title localization, Hebrew detection, description generation.
 * Artist normalization lives in artistNormalization.js — this module handles everything else.
 */

import { englishToHebrew } from "./artistNormalization.js";

// ─── Song Title Cleaning ───

/**
 * Patterns to strip from song titles — non-essential metadata that hurts gameplay.
 * Order matters: more specific patterns first.
 */
const STRIP_PATTERNS = [
  /\s*\(Remaster(?:ed)?\)/gi,
  /\s*\(Re-?master(?:ed)?\s*\d*\)/gi,
  /\s*\((?:feat\.?|ft\.?|with)\s+[^)]+\)/gi,
  /\s*\((?:Live|Acoustic|Demo|Bonus\s*Track|Radio\s*(?:Edit|Version)|Single\s*Version|Album\s*Version|Mono|Stereo)\)/gi,
  /\s*\((?:\d{4}\s*)?(?:Remaster(?:ed)?|Remix|Version|Edit|Mix)\)/gi,
  /\s*\[\s*(?:Remaster(?:ed)?|feat\.?\s+[^\]]+|Live|Acoustic)\s*\]/gi,
  /\s*-\s*(?:Remaster(?:ed)?|Live|Acoustic|Radio\s*Edit)\s*$/gi,
];

/**
 * Remove non-essential parenthetical/bracket suffixes from a song title.
 * Preserves meaningful parenthetical content (e.g., "(Part 2)", "(שיר הסיום)").
 */
export function cleanSongTitle(title) {
  if (!title) return title;
  let cleaned = title;
  for (const pattern of STRIP_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }
  return cleaned.trim();
}

// ─── Song Title Localization ───

/**
 * Known transliterated Hebrew song titles → proper Hebrew.
 * Only includes common titles that iTunes consistently returns in English transliteration.
 * This is intentionally conservative — we only map titles we're confident about.
 */
const titleTransliterations = {
  slicha: "סליחה",
  "bo'i": "בואי",
  boi: "בואי",
  natati: "נתתי",
  "yesh bi ahava": "יש בי אהבה",
  "ani ve'ata": "אני ואתה",
  "ani veata": "אני ואתה",
  "erev shel shoshanim": "ערב של שושנים",
  "yerushalayim shel zahav": "ירושלים של זהב",
  "lu yehi": "לו יהי",
  "hallelujah": "הללויה",
  "al kol eleh": "על כל אלה",
  "od lo ahavti dai": "עוד לא אהבתי די",
  "perach": "פרח",
  "shir la'shalom": "שיר לשלום",
  "shir lashalom": "שיר לשלום",
  "ba'shanah ha'ba'ah": "בשנה הבאה",
  "bashanah habaah": "בשנה הבאה",
  "hora": "הורה",
  "ke'ilu": "כאילו",
  keilu: "כאילו",
  "stam": "סתם",
  "yalla": "יאללה",
  "sababa": "סבבה",
  "habibi": "חביבי",
  "ahava": "אהבה",
  "geshem": "גשם",
  "boker tov": "בוקר טוב",
  "layla": "לילה",
  "derech": "דרך",
  "hayom": "היום",
  "po": "פה",
  "kan": "כאן",
  "tov": "טוב",
  "lama": "למה",
  "rak": "רק",
  "kmo": "כמו",
  "im": "אם",
  "ba": "בא",
  "yom": "יום",
  "sof": "סוף",
  "kol": "כל",
  "et": "את",
  "shir": "שיר",
  "chai": "חי",
};

/**
 * If a song title is a known transliterated Hebrew title, return the Hebrew form.
 * Only applies when the full title matches — we don't do partial replacements.
 */
export function normalizeSongTitle(title) {
  if (!title) return title;
  const key = title.toLowerCase().trim();
  return titleTransliterations[key] || title;
}

// ─── Hebrew Content Detection ───

// Build a reverse lookup set: all known Hebrew artist names (lowercase)
const hebrewArtistNames = new Set(Object.values(englishToHebrew).map((n) => n.toLowerCase()));
// Also include the English keys so we can detect "kaveret" as Hebrew-oriented
const knownHebrewArtistKeys = new Set(Object.keys(englishToHebrew));

/**
 * Check if an artist name refers to a known Hebrew/Israeli artist.
 */
export function isHebrewArtist(artistName) {
  if (!artistName) return false;
  const lower = artistName.toLowerCase().trim();
  return hebrewArtistNames.has(lower) || knownHebrewArtistKeys.has(lower);
}

/**
 * Check if text contains Hebrew characters.
 */
export function containsHebrew(text) {
  if (!text) return false;
  return /[\u0590-\u05FF]/.test(text);
}

/**
 * Determine if a set of songs is predominantly Hebrew-oriented.
 * Returns true if majority of artists are known Hebrew artists or have Hebrew names.
 */
export function isHebrewContent(songs) {
  if (!songs || songs.length === 0) return false;
  let hebrewCount = 0;
  for (const song of songs) {
    if (isHebrewArtist(song.artist) || containsHebrew(song.artist) || containsHebrew(song.title)) {
      hebrewCount++;
    }
  }
  return hebrewCount >= songs.length * 0.5;
}

// ─── Game Description Generation ───

/**
 * Generate a sensible default Hebrew description for a game based on its title.
 * Returns a Hebrew description if the content is Hebrew-oriented, English otherwise.
 */
export function deriveGameDescription(title, songs) {
  if (!title) return "";
  const hebrew = isHebrewContent(songs) || containsHebrew(title);

  if (hebrew) {
    return `משחק ניחוש שירים עם שירים של ${title}`;
  }
  return `Music guessing game featuring songs by ${title}`;
}
