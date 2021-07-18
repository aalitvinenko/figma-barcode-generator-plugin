export const CREATE_BARCODE_COMMAND_TYPE = "CREATE_BARCODE_COMMAND_TYPE";
export const CANCEL_COMMAND_TYPE = "CANCEL_COMMAND_TYPE";

export type CreateBarcodeCommand = {
    type: typeof CREATE_BARCODE_COMMAND_TYPE,
    payload: {
        value: string,
        width: number,
        height: number,
        color: string,
    }
}

export type CancelCommandType = {
    type: typeof CANCEL_COMMAND_TYPE,
}

type Command = CreateBarcodeCommand | CancelCommandType;

export default Command;