export function convertRgbaToRgb(rgba: string, isDark: boolean): string {
    const parts = rgba.match(/[\d.]+/g);
    if (!parts || parts.length < 4) return rgba;
    
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    const a = parseFloat(parts[3]);

    const bgR = isDark ? 0 : 255;
    const bgG = isDark ? 0 : 255;
    const bgB = isDark ? 0 : 255;

    const outR = Math.round((1 - a) * bgR + a * r);
    const outG = Math.round((1 - a) * bgG + a * g);
    const outB = Math.round((1 - a) * bgB + a * b);

    return `rgb(${outR}, ${outG}, ${outB})`;
}

export function rgbToHex(rgbStr: string): string {
    if (rgbStr.startsWith('#')) return rgbStr;
    const parts = rgbStr.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return rgbStr;
    const r = parseInt(parts[0], 10).toString(16).padStart(2, '0');
    const g = parseInt(parts[1], 10).toString(16).padStart(2, '0');
    const b = parseInt(parts[2], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}
