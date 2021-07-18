import Command, {
  CREATE_BARCODE_COMMAND_TYPE,
  CANCEL_COMMAND_TYPE,
} from "../shared/commands";

import Response, {
  BARCODE_CREATED_RESPONSE,
  ERROR_RESPONSE,
} from "../shared/responses";
import { generateChecksum, validate } from "../utils";

figma.showUI(__html__);
figma.ui.resize(500, 370);

figma.ui.onmessage = (command: Command) => {
  switch (command.type) {
    case CREATE_BARCODE_COMMAND_TYPE:
      {
        try {
          generateBarcode(
            command.payload.value,
            command.payload.width,
            command.payload.height,
            command.payload.color
          );
        } catch (e) {
          sendError((e as Error).message);
        }
      }
      break;
    case CANCEL_COMMAND_TYPE:
      {
        figma.closePlugin();
      }
      break;
  }
};

const sendError = (value: any) => {
  sendResponse({ type: ERROR_RESPONSE, payload: { message: value } });
};

const sendResponse = (response: Response) => {
  figma.ui.postMessage(response);
};

const getCode = (value: string) => {
  const tables = [
    [0xd, 0x19, 0x13, 0x3d, 0x23, 0x31, 0x2f, 0x3b, 0x37, 0xb],
    [0x27, 0x33, 0x1b, 0x21, 0x1d, 0x39, 0x5, 0x11, 0x9, 0x17],
    [0x72, 0x66, 0x6c, 0x42, 0x5c, 0x4e, 0x50, 0x44, 0x48, 0x74],
  ];

  const countries = [0x0, 0xb, 0xd, 0xe, 0x13, 0x19, 0x1c, 0x15, 0x16, 0x1a];

  const prefix = parseInt(value.substr(0, 1), 10);
  const encoding = countries[prefix];
  const raw_number = value.substr(1);
  const parts = raw_number.split("");

  let leftCode = 0;
  let i = 0;
  while (i <= 5) {
    const table = (encoding >> (5 - i)) & 0x1;
    leftCode *= Math.pow(2, 7);
    const digit = parseInt(parts[i], 10);
    leftCode += tables[table][digit];
    i++;
  }

  let rightCode = 0;
  i = 0;
  while (i <= 5) {
    rightCode *= Math.pow(2, 7);
    const digit = parseInt(parts[6 + i], 10);
    rightCode += tables[2][digit];
    i++;
  }

  return [leftCode, rightCode];
};

const generateBarcode = (
  value: string,
  width: number,
  height: number,
  color: string
) => {
  const result = validate(value);
  if (!result.isValid) {
    throw new Error(result.error);
  }

  if (value.length === 12) {
    value += generateChecksum(value);
  }

  const code = getCode(value);
  const rgbColor = tryParseColor(color) ?? ({ r: 0, g: 0, b: 0 } as RGB);

  draw(value, code, width, height, rgbColor);

  figma.notify(`Barcode with value ${value} created`);
  sendResponse({ type: BARCODE_CREATED_RESPONSE, payload: { value: value } });
};

const draw = (
  value: string,
  code: number[],
  width: number,
  height: number,
  color: RGB
) => {
  const item_width = width / 95;

  const nodes: SceneNode[] = [];

  let left = 0;
  nodes.push(fillRect(left, 0, item_width, height, color));

  left = left + item_width * 2;
  nodes.push(fillRect(left, 0, item_width, height, color));

  left = left + item_width * 7 * 6;
  let i = 0;
  while (i <= 42) {
    if (code[0] % 2) {
      nodes.push(fillRect(left, 0, item_width, height, color));
    }
    left = left - item_width;
    code[0] = Math.floor(code[0] / 2);
    i++;
  }

  left = left + item_width * (7 * 6) + 3 * item_width;
  nodes.push(fillRect(left, 0, item_width, height, color));

  left = left + item_width * 2;
  nodes.push(fillRect(left, 0, item_width, height, color));

  left = left + item_width * 7 * 6 + item_width;
  while (code[1] > 0) {
    if (code[1] % 2) {
      nodes.push(fillRect(left, 0, item_width, height, color));
    }
    left = left - item_width;
    code[1] = Math.floor(code[1] / 2);
  }

  left = left + item_width * 7 * 6 + item_width;
  nodes.push(fillRect(left, 0, item_width, height, color));

  left = left + item_width * 2;
  nodes.push(fillRect(left, 0, item_width, height, color));

  const group = figma.group(nodes, figma.currentPage);
  group.name = `Barcode ${value}`;
  figma.currentPage.selection = [group];
  figma.viewport.scrollAndZoomIntoView([group]);
};

const fillRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB
) => {
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.fills = [{ type: "SOLID", color }];

  return rect;
};

const tryParseColor = (color?: string | null) => {
  if (color === undefined || color === null) return null;

  const normal = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (normal) {
    const components = normal.slice(1).map((e) => parseInt(e, 16));
    return {
      r: components[0] / 255,
      g: components[1] / 255,
      b: components[2] / 255,
    } as RGB;
  }

  const shorthand = color.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (shorthand) {
    const components = shorthand.slice(1).map((e) => 0x11 * parseInt(e, 16));
    return {
      r: components[0] / 255,
      g: components[1] / 255,
      b: components[2] / 255,
    } as RGB;
  }

  return null;
};
