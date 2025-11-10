import colorMapping from './colorMapping.json' assert { type: 'json' };

const getBackgroundColor = (load: number) => {
  const keys = Object.keys(colorMapping).filter(k => !isNaN(Number(k))) as Array<keyof typeof colorMapping>;
  const values = Object.values(colorMapping);

  if (load <= 0) return values[0];
  if (load >= 30) return values[values.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    const key1 = parseInt(keys[i], 10);
    const key2 = parseInt(keys[i + 1], 10);

    if (load >= key1 && load < key2) {
      const ratio = (load - key1) / (key2 - key1);
      const color1 = parseInt(values[i].substring(1), 16);
      const color2 = parseInt(values[i + 1].substring(1), 16);

      const r = Math.round(
        ((color2 >> 16) & 0xff) * ratio + ((color1 >> 16) & 0xff) * (1 - ratio)
      );
      const g = Math.round(
        ((color2 >> 8) & 0xff) * ratio + ((color1 >> 8) & 0xff) * (1 - ratio)
      );
      const b = Math.round(
        (color2 & 0xff) * ratio + (color1 & 0xff) * (1 - ratio)
      );

      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
  }
  return values[0];
};

const getTextColor = (backgroundColor: string) => {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.substring(1, 3), 16);
  const g = parseInt(backgroundColor.substring(3, 5), 16);
  const b = parseInt(backgroundColor.substring(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Test the functions
console.log("Testing color mapping:");
for (let i = 0; i <= 30; i += 5) {
  console.log(`Load: ${i}, Background Color: ${getBackgroundColor(i)}, Text Color: ${getTextColor(getBackgroundColor(i))}`);
}
