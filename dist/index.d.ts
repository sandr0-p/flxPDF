/// <reference types="node" />
import { Types } from './Types';
export declare class flxPDF {
    private _gs;
    /**
     *
     */
    constructor();
    /**
     * Writes a PDF file which is provided as a ArrayBuffer, Base64 string, Buffer or File Path to an temporary folder.
     * @param data The file to be written to the temporary location, provided as a ArrayBuffer, Base64 string, Buffer or File Path.
     * @param mode The [[Types.Mode]] which the data is provided in.
     * @returns Returns a Promise of type [[Types.Result]] which contains the file path if resolved, or the error message if rejected.
     */
    writeFile(data: ArrayBuffer | Buffer | string, mode: Types.Mode): Promise<Types.Result>;
    /**
     * Extracts the amount if pages of a given PDF file using ghostscript
     * @param filePath Path to the PDF file
     * @returns Returns a Promise of type [[Types.Result]] which contains the amount of pages if resolved, or the error message if rejected.
     */
    getPageCount(filePath: string): Promise<Types.Result>;
    /**
     * Converts the pages of a given PDF file into images. Each page will be a seperate image.
     * @param filePath The path to the PDF File to be converted into images
     * @param pages The amount of pages in the file
     * @returns Returns a Promise of type [[Types.Result]] which contains the array with the paths to the image representation of the pages if resolved, or the error message if rejected.
     */
    convertPages(filePath: string): Promise<Types.Result>;
    /**
     * Creates a DataUrl representation from the png files provided.
     * @param filePaths An array containing the paths to the png files
     * @returns Returns a Promise of type [[Types.Result]] which contains an array with the DataUrl representation of the images if resolved, or the error message if rejected.
     */
    getData(filePaths: Array<string>, mode: Types.Mode): Promise<Types.Result>;
}

/**
 * This module provides the types for [[flxPDF]]
 */
export declare namespace Types {
    /**
     * Defines a request to convert a PDF file.
     */
    interface Request {
        /**
         * The [[Mode]] the files are provided in.
         */
        mode: Mode;
        /**
         * The PDF to be converted.
         */
        data: ArrayBuffer | Buffer | string;
    }
    /**
     * Defines the modes in which the PDF file can be provided.
     */
    enum Mode {
        ArrayBuffer = 0,
        Base64 = 1,
        Buffer = 2,
        File = 3
    }
    interface Result {
        success: boolean;
        data?: any;
        message?: string;
    }
}
