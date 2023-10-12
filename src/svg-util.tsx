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

function getCursorPath(newX: number, newY: number): string {
  const pathData =
    'M9.6,17.3v13.5c0,0-1.3,3.2-5.1,3.2s-3.8,0-3.8,0 M9.6,17.3V3.9c0,0-1.3-3.2-5.1-3.2s-3.8,0-3.8,0 M9.6,17.3V3.9c0,0,1.3-3.2,5.1-3.2s3.8,0,3.8,0 M9.6,17.3v13.5c0,0,1.3,3.2,5.1,3.2s3.8,0,3.8,0 M6.1 17.3 L13.1 17.3 M20.6,19.3';
  const commands = pathData.match(/[a-df-z]|[-+]?\d*\.?\d+/gi) || [];
  let updatedPath = '';

  let currentX = 0;
  let currentY = 0;

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const nextCommand = commands[i + 1];

    if (command === 'M' || command === 'L') {
      const x = parseFloat(nextCommand);
      const y = parseFloat(commands[i + 2]);

      const updatedX = x + newX;
      const updatedY = y + newY;

      updatedPath += `${command}${updatedX.toFixed(1)},${updatedY.toFixed(1)}`;

      currentX = updatedX;
      currentY = updatedY;

      i += 2;
    } else {
      updatedPath += command;
    }

    if (nextCommand === 'M' || nextCommand === 'm') {
      updatedPath += ' ';
    }
  }

  console.log('to return', updatedPath);

  return updatedPath;
}
export { getPathFromRect, createSVGPath, getCursorPath };
