import Command, {
  CREATE_BARCODE_COMMAND_TYPE,
  CANCEL_COMMAND_TYPE,
  SHOW_ERROR_COMMAND_TYPE,
  ShowErrorCommand,
} from "../shared/commands";

import { validate } from "../utils";

import "./ui.css";

const handleColorChange = (ev: Event) => {
  var input = ev.target as HTMLInputElement;
  input.style.backgroundColor = input.value;
};

const handleValueBlur = (ev: Event) => {
  var input = ev.target as HTMLInputElement;
  validateValue(input.value);
};

const handleCreateClick = () => {
  const value = (document.getElementById("value") as HTMLInputElement).value;

  if (!validateValue(value)) return;

  const width = parseInt(
    (document.getElementById("width") as HTMLInputElement).value
  );
  const height = parseInt(
    (document.getElementById("height") as HTMLInputElement).value
  );
  const color = (document.getElementById("color") as HTMLInputElement).value;

  sendCommand({
    type: CREATE_BARCODE_COMMAND_TYPE,
    payload: { value, width, height, color },
  });
};

const handleCancelClick = () => {
  sendCommand({
    type: CANCEL_COMMAND_TYPE,
  });
};

const handleShowErrorCommand = (command: ShowErrorCommand) => {
  setError(command.payload.message);
}

const validateValue = (value: string): boolean => {
  const result = validate(value);

  setError(result.error);

  return result.isValid;
};

const setError = (error?: string) => {
  document.getElementById("error").innerText = error || "";
};

const sendCommand = (command: Command) => {
  parent.postMessage(
    {
      pluginMessage: command,
    },
    "*"
  );
};

window.onload = () => {
  document.getElementById("value").onblur = handleValueBlur;
  document.getElementById("create").onclick = handleCreateClick;
  document.getElementById("cancel").onclick = handleCancelClick;
  document.getElementById("color").onchange = handleColorChange;

  document.getElementById("color").dispatchEvent(new Event("change"));
};

window.onmessage = (event: MessageEvent<any>) => {
  var command = event.data.pluginMessage as Command;

  switch (command.type) {
    case SHOW_ERROR_COMMAND_TYPE:
      {
        handleShowErrorCommand(command);
      }
      break;
  }
};
