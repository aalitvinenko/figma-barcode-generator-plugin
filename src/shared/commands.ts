export const CREATE_BARCODE_COMMAND_TYPE = "CREATE_BARCODE_COMMAND_TYPE";
export const CANCEL_COMMAND_TYPE = "CANCEL_COMMAND_TYPE";
export const SHOW_ERROR_COMMAND_TYPE = "SHOW_ERROR_COMMAND_TYPE";

export type CreateBarcodeCommand = {
    type: typeof CREATE_BARCODE_COMMAND_TYPE,
    payload: {
        value: string,
        width: number,
        height: number,
        color: string,
    }
}

export type CancelCommand = {
    type: typeof CANCEL_COMMAND_TYPE,
}

export type ShowErrorCommand = {
    type: typeof SHOW_ERROR_COMMAND_TYPE,
    payload: {
        message: string
    }
}

type Command = CreateBarcodeCommand | CancelCommand | ShowErrorCommand;

export default Command;