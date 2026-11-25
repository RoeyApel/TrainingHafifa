const DECIMALS = 1;

/**
 * An SVG path of the polygon's outer ring, scaled to fit a `size` x `size`
 * box and centered in it. Y is flipped because the map's y grows north and
 * SVG's grows down.
 */
export const toFootprintPath = (
  ring: readonly (readonly number[])[],
  size: number,
): string => {
  const xs = ring.map(([x]) => x);
  const ys = ring.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const width = Math.max(...xs) - minX;
  const height = maxY - Math.min(...ys);
  // A sliver with no extent would divide by zero.
  const scale = size / (Math.max(width, height) || 1);
  const offsetX = (size - width * scale) / 2;
  const offsetY = (size - height * scale) / 2;

  const points = ring.map(([x, y]) => {
    const px = offsetX + (x - minX) * scale;
    const py = offsetY + (maxY - y) * scale;
    return `${px.toFixed(DECIMALS)},${py.toFixed(DECIMALS)}`;
  });
  return `M${points.join('L')}Z`;
};
