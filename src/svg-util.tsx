function getPathFromRect(
  x: number,
  y: number,
  width: number,
  height: number,
  borderRadius: number = 0
) {
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (width < 0) width = 0;
  if (height < 0) height = 0;
  if (borderRadius < 0) borderRadius = 0;

  if (borderRadius > width / 2 || borderRadius > height / 2) {
    return ''; // Invalid border radius
  }

  var path = 'M' + (x + borderRadius) + ',' + y;
  path += 'L' + (x + width - borderRadius) + ',' + y;
  path +=
    'Q' + (x + width) + ',' + y + ' ' + (x + width) + ',' + (y + borderRadius);
  path += 'L' + (x + width) + ',' + (y + height - borderRadius);
  path +=
    'Q' +
    (x + width) +
    ',' +
    (y + height) +
    ' ' +
    (x + width - borderRadius) +
    ',' +
    (y + height);
  path += 'L' + (x + borderRadius) + ',' + (y + height);
  path +=
    'Q' + x + ',' + (y + height) + ' ' + x + ',' + (y + height - borderRadius);
  path += 'L' + x + ',' + (y + borderRadius);
  path += 'Q' + x + ',' + y + ' ' + (x + borderRadius) + ',' + y;
  path += 'z';

  return path;
}

function createSVGPath(x: number, y: number, width: number): string {
  // Calculate the coordinates for the path
  const startX = x;
  const startY = y;
  const endX = x + width;
  const endY = y;

  // Build the SVG path string
  const path = `M ${startX} ${startY} L ${endX} ${endY}`;

  return path;
}

export { getPathFromRect, createSVGPath };
