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

export const getEditDistance = (a: string, b: string): number => {
    if (!a) a = "";
    if (!b) b = "";
    if (a.length === 0) return b.length; 
    if (b.length === 0) return a.length; 

    if (Math.abs(a.length - b.length) > 10) return 999; 

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, 
                                        Math.min(matrix[i][j-1] + 1, 
                                                 matrix[i-1][j] + 1)); 
            }
        }
    }
    return matrix[b.length][a.length];
};

export const areQuestionsSimilar = (qNorm1: string, optsNorm1: string, qNorm2: string, optsNorm2: string): boolean => {
    if (qNorm1 === qNorm2 && optsNorm1 === optsNorm2) return true;
    
    const qDist = getEditDistance(qNorm1, qNorm2);
    const qAllowedDist = Math.max(2, Math.floor(Math.min(qNorm1.length, qNorm2.length) * 0.1));
    if (qDist > qAllowedDist) return false;

    const optDist = getEditDistance(optsNorm1, optsNorm2);
    const optAllowedDist = Math.max(3, Math.floor(Math.min(optsNorm1.length, optsNorm2.length) * 0.1));
    if (optDist > optAllowedDist) return false;

    return true;
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
