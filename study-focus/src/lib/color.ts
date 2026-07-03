const FALLBACK_COLOR = "#4f46e5";
const HEX_COLOR_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHexColor(color?: string | null): string {
  if (!color || !HEX_COLOR_RE.test(color.trim())) {
    return FALLBACK_COLOR;
  }

  const hex = color.trim().replace("#", "");

  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }

  return `#${hex}`;
}

function hexToRgb(color?: string | null) {
  const hex = normalizeHexColor(color).replace("#", "");
  const value = parseInt(hex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function alphaColor(color: string | null | undefined, alpha: number) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function readableTextColor(color: string | null | undefined) {
  const { r, g, b } = hexToRgb(color);
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance > 0.45 ? "#1f2937" : "#ffffff";
}
