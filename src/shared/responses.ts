export const BARCODE_CREATED_RESPONSE = "BARCODE_CREATED_RESPONSE";
export const ERROR_RESPONSE = "ERROR_RESPONSE";

export type BarcodeCreatedResponse = {
    type: typeof BARCODE_CREATED_RESPONSE,
    payload: {
        value: string
    }
}

export type ErrorResponse = {
    type: typeof ERROR_RESPONSE,
    payload: {
        message: string
    }
}

type Response = BarcodeCreatedResponse | ErrorResponse;

export default Response;