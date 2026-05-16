/**
 * Robust normalization for Bangla strings to handle Unicode variations (NFC/NFD).
 * Also handles common variations of 'য়', 'ড়', 'ঢ়' and removes invisible characters.
 */
export const normalizeBangla = (str: string | null | undefined): string => {
    if (!str) return "";
    return str.normalize('NFC')
              .replace(/\u09AF\u09BC/g, '\u09DF') // য + ় -> য়
              .replace(/\u09A1\u09BC/g, '\u09DC') // ড + ় -> ড়
              .replace(/\u09A2\u09BC/g, '\u09DD') // ঢ + ় -> ঢ়
              .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero width chars
              .replace(/[\s\t\n\r]/g, ' ')           // Standardize whitespace
              .trim();
};

/**
 * Aggressive normalization for internal keys and comparison.
 */
export const normalizeForComparison = (str: string | null | undefined): string => {
    if (!str) return "";
    return normalizeBangla(str)
              .replace(/[.,;:"'’|।]/g, '')           // Punctuation
              .replace(/\s+/g, '')                  // Remove all spaces
              .toLowerCase();
};

/**
 * Returns a unique array of strings by normalizing them first.
 * Essential for preventing duplicate entries in UI due to NFC/NFD variations.
 */
export const uniqueByNormalization = (arr: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    
    arr.forEach(item => {
        const norm = normalizeForComparison(item);
        if (!seen.has(norm)) {
            seen.add(norm);
            result.push(item);
        }
    });
    
    return result;
};
