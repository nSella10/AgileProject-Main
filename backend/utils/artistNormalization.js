/**
 * Shared artist name normalization: English iTunes names → Hebrew equivalents.
 * Single source of truth — used by gameService (search results), answerMatching, etc.
 */

// English (lowercase) → preferred Hebrew name
const englishToHebrew = {
  "danny sanderson": "דני סנדרסון",
  "shlomo artzi": "שלמה ארצי",
  rita: "ריטה",
  "shalom hanoch": "שלום חנוך",
  "arik einstein": "אריק איינשטיין",
  "matti caspi": "מתי כספי",
  "yehudit ravitz": "יהודית רביץ",
  "david broza": "דוד ברוזה",
  "chava alberstein": "חוה אלברשטיין",
  "naomi shemer": "נעמי שמר",
  "ehud banai": "אהוד בנאי",
  "berry sakharof": "ברי סחרוף",
  "ofra haza": "עפרה חזה",
  "riki gal": "ריקי גל",
  "zohar argov": "זוהר ארגוב",
  "yossi banai": "יוסי בנאי",
  "gidi gov": "גידי גוב",
  "boaz sharabi": "בועז שרעבי",
  "yehuda poliker": "יהודה פוליקר",
  "rami kleinstein": "רמי קליינשטיין",
  "corinne allal": "קורין אלאל",
  "margalit tzan'ani": "מרגלית צנעני",
  "yardena arazi": "ירדנה ארזי",
  ilanit: "אילנית",
  daklon: "דקלון",
  "svika pick": "צביקה פיק",
  "mike brant": "מייק בראנט",
  "tzvika hadar": "צביקה הדר",
  mashina: "משינה",
  kaveret: "כוורת",
  typex: "טייפקס",
  teapacks: "טיפקס",
  subliminal: "סאבלימינל",
  "infected mushroom": "אינפקטד מאשרום",
  "asaf avidan": "אסף אבידן",
  "idan raichel": "עידן רייכל",
  "ninet tayeb": "נינט טייב",
  "static & ben el": "סטטיק ובן אל",
  "eden ben zaken": "עדן בן זקן",
  "noa kirel": "נועה קירל",
  "omer adam": "עומר אדם",
  "sarit hadad": "שרית חדד",
  "eyal golan": "אייל גולן",
  "the shadow": "הצל",
  "hadag nahash": "הדג נחש",
  "monica sex": "מוניקה סקס",
  "jane bordeaux": "ג'יין בורדו",
  "red band": "רד בנד",
  rockfour: "רוקפור",
  monica: "מוניקה",
};

/**
 * If the artist name matches a known English→Hebrew mapping, return the Hebrew name.
 * Otherwise return the original name unchanged.
 */
export function normalizeArtistName(artistName) {
  if (!artistName) return artistName;
  const key = artistName.toLowerCase().trim();
  return englishToHebrew[key] || artistName;
}

/**
 * The raw mapping, exported for modules that need the full map
 * (e.g., answerMatching.js for generating variations).
 */
export { englishToHebrew };
