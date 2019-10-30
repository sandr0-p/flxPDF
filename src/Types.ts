/**
 * This module provides the types for [[flxPDF]]
 */
export namespace Types {
    /**
     * Defines a request to convert a PDF file.
     */
    export interface Request {
        /**
         * The [[Mode]] the files are provided in.
         */
        mode: Mode;
        /**
         * The PDF to be converted.
         */
        data: ArrayBuffer | Buffer | string
    }

    /**
     * Defines the modes in which the PDF file can be provided.
     */
    export enum Mode {
        ArrayBuffer,
        Base64,
        Buffer,
        File
    }

    export interface Result {
        success: boolean;
        data?: any;
        message?: string;
    }
}