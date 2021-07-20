import Command, {
  CREATE_BARCODE_COMMAND_TYPE,
  CANCEL_COMMAND_TYPE,
  SHOW_ERROR_COMMAND_TYPE,
  CreateBarcodeCommand,
  CancelCommand
} from "../shared/commands";

import { generateChecksum, validate } from "../utils";
import Ean13Code from "./ean13code";

figma.showUI(__html__);
figma.ui.resize(500, 370);

figma.ui.onmessage = (command: Command) => {
  try {
    switch (command.type) {
      case CREATE_BARCODE_COMMAND_TYPE:
        {
          handleCreateBarcodeCommand(command);
        }
        break;
      case CANCEL_COMMAND_TYPE:
        {
          handleCancelCommand(command);
        }
        break;
    }
  } catch (e) {
    sendCommand({
      type: SHOW_ERROR_COMMAND_TYPE,
      payload: { message: (e as Error).message },
    });
  }
};

const handleCreateBarcodeCommand = (command: CreateBarcodeCommand): void => {
  let value = command.payload.value;
  const { width, height, color } = command.payload;

  const result = validate(value);
  if (!result.isValid) {
    throw new Error(result.error);
  }

  if (value.length === 12) {
    value += generateChecksum(value);
  }

  const code = encode(value);
  const rgbColor = tryParseColor(color) ?? ({ r: 0, g: 0, b: 0 } as RGB);

  drawBarcode(value, code, width, height, rgbColor);

  figma.notify(`Barcode with value ${value} created`);
};

const handleCancelCommand = (command: CancelCommand) => {
  figma.closePlugin();
};

const sendCommand = (command: Command): void => {
  figma.ui.postMessage(command);
};

const encode = (value: string): Ean13Code => {
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

  return new Ean13Code(leftCode, rightCode);
};

const drawBarcode = (
  value: string,
  code: Ean13Code,
  width: number,
  height: number,
  color: RGB
) => {
  const rectWidth = width / 95;

  const nodes: SceneNode[] = [];

  // static start part
  let currentX = 0;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  currentX = currentX + rectWidth * 2;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  // left part of code
  currentX = currentX + rectWidth * 7 * 6;
  let leftCodeCurrentRemainder = code.left;
  for (let i = 0; i <= 42; i++) {
    if (leftCodeCurrentRemainder % 2) {
      nodes.push(createRectangle(currentX, 0, rectWidth, height, color));
    }

    currentX = currentX - rectWidth;
    leftCodeCurrentRemainder = Math.floor(leftCodeCurrentRemainder / 2);
  }

  // static middle part
  currentX = currentX + rectWidth * (7 * 6) + 3 * rectWidth;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  currentX = currentX + rectWidth * 2;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  // right part of code
  currentX = currentX + rectWidth * 7 * 6 + rectWidth;
  let rightCodeCurrentRemainder = code.right;
  while (rightCodeCurrentRemainder > 0) {
    if (rightCodeCurrentRemainder % 2) {
      nodes.push(createRectangle(currentX, 0, rectWidth, height, color));
    }

    currentX = currentX - rectWidth;
    rightCodeCurrentRemainder = Math.floor(rightCodeCurrentRemainder / 2);
  }

  // static end part
  currentX = currentX + rectWidth * 7 * 6 + rectWidth;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  currentX = currentX + rectWidth * 2;
  nodes.push(createRectangle(currentX, 0, rectWidth, height, color));

  // finishing touches
  const group = figma.group(nodes, figma.currentPage);
  group.name = `Barcode ${value}`;
  figma.currentPage.selection = [group];
  figma.viewport.scrollAndZoomIntoView([group]);
};

const createRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB
): RectangleNode => {
  const rect = figma.createRectangle();
  rect.x = x;
  rect.y = y;
  rect.resize(width, height);
  rect.fills = [{ type: "SOLID", color }];

  return rect;
};

const tryParseColor = (color?: string | null): RGB | null => {
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
