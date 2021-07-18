import Command, {
  CREATE_BARCODE_COMMAND_TYPE,
  CANCEL_COMMAND_TYPE,
} from "../shared/commands";

import Response, {
  BARCODE_CREATED_RESPONSE,
  ERROR_RESPONSE,
} from "../shared/responses";
import { validate } from "../utils";

import "./ui.css";

window.onmessage = (event: MessageEvent<any>) => {
  var response = event.data.pluginMessage as Response;

  switch (response.type) {
    case BARCODE_CREATED_RESPONSE:
      break;
    case ERROR_RESPONSE:
      {
        setError(response.payload.message);
      }
      break;
  }
};

const setError = (error?: string) => {
  document.getElementById("error").innerText = error || "";
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

const validateValue = (value: string): boolean => {
  const result = validate(value);

  setError(result.error);

  return result.isValid;
};

const handleColorChange = (ev: Event) => { 
  var input = (ev.target as HTMLInputElement);
  input.style.backgroundColor = input.value;
}

const handleValueBlur = (ev: Event) => { 
  var input = (ev.target as HTMLInputElement);
  validateValue(input.value)
}

window.onload = () => {
  document.getElementById("value").onblur = handleValueBlur;
  document.getElementById("create").onclick = handleCreateClick;
  document.getElementById("cancel").onclick = handleCancelClick;
  document.getElementById("color").onchange = handleColorChange;

  document.getElementById("color").dispatchEvent(new Event("change"));
};

const sendCommand = (command: Command) => {
  parent.postMessage(
    {
      pluginMessage: command,
    },
    "*"
  );
};
