import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { Types } from './Types';
import uuid = require('uuid/v4');

export default class flxPDF {
    private _gs: string;

    /**
     *
     */
    constructor() {
        // Set GhostScript path
        this._gs = path.join(__dirname, 'gs', 'gs.exe');
        this._gs = this._gs.split('\\').join('/');
    }

    /**
     * Writes a PDF file which is provided as a ArrayBuffer, Base64 string, Buffer or File Path to an temporary folder.
     * @param data The file to be written to the temporary location, provided as a ArrayBuffer, Base64 string, Buffer or File Path.
     * @param mode The [[Types.Mode]] which the data is provided in.
     * @returns Returns a Promise of type [[Types.Result]] which contains the file path if resolved, or the error message if rejected.
     */
    public writeFile(data: ArrayBuffer | Buffer | string, mode: Types.Mode): Promise<Types.Result> {
        return new Promise((resolve, reject) => {
            try {
                let buffer: Buffer;
                let tmpPath = path.join(__dirname, 'tmp', uuid());
                let fileName = `${uuid()}.pdf`;

                // Create tmp folder
                if (!fs.existsSync(tmpPath)) {
                    fs.mkdirSync(tmpPath);
                }

                // Set Buffer or Copy data to tmp folder
                if (mode === Types.Mode.ArrayBuffer) {
                    buffer = new Buffer(data as ArrayBuffer);
                } else if (mode === Types.Mode.Base64) {
                    buffer = Buffer.from(data as string, 'base64');
                } else if (mode === Types.Mode.Buffer) {
                    buffer = data as Buffer;
                } else if (mode === Types.Mode.File) {
                    fileName = path.basename(data as string);
                    fs.copyFileSync(data as string, path.join(tmpPath, fileName));
                    resolve({ success: true, data: path.join(tmpPath, fileName) } as Types.Result);
                    return;
                }

                // Check if Buffer is set.
                if (!buffer) {
                    reject({ success: false, message: 'Buffer does not contain data, unable to write file.' } as Types.Result);
                    return;
                }

                // Write data to tmp folder
                fs.writeFileSync(path.join(tmpPath, fileName), buffer, { flag: 'wx' });
                resolve({ success: true, data: path.join(tmpPath, fileName) } as Types.Result);
                return;

            } catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error } as Types.Result);
                return;
            }
        });
    }

    /**
     * Extracts the amount if pages of a given PDF file using ghostscript
     * @param filePath Path to the PDF file
     * @returns Returns a Promise of type [[Types.Result]] which contains the amount of pages if resolved, or the error message if rejected.
     */
    public getPageCount(filePath: string): Promise<Types.Result> {
        return new Promise((resolve, reject) => {
            try {
                // Setup gs command
                // https://stackoverflow.com/a/4829240/1828179
                let cmd: string = `gs -q -dNODISPLAY -c "(${filePath}) (r) file runpdfbegin pdfpagecount = quit"`;

                // Execute GS command synchronous in child process
                let output: string = cp.execSync(cmd).toString();

                // Convert to number as this is the expected result
                let pageCount: number = Number(output);

                // If Not A Number, reject Promise and return output
                if (isNaN(pageCount)) {
                    reject({ success: false, message: output } as Types.Result);
                    return;
                }

                // Resove Promise and retunr page cound
                resolve({ success: true, data: pageCount } as Types.Result)
            } catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error } as Types.Result);
                return;
            }
        });
    }

    /**
     * Converts the pages of a given PDF file into images. Each page will be a seperate image.
     * @param filePath The path to the PDF File to be converted into images
     * @param pages The amount of pages in the file
     * @returns Returns a Promise of type [[Types.Result]] which contains the array with the paths to the image representation of the pages if resolved, or the error message if rejected.
     */
    public convertPages(filePath: string): Promise<Types.Result> {
        return new Promise((resolve, reject) => {
            try {
                // Setup gs command
                // https://stackoverflow.com/a/3379649/1828179
                let cmd: string = `gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -o file-%d.png -r144 ${filePath}`;

                // Execute GS command synchronous in child process
                let output: string = cp.execSync(cmd).toString();

                // If output is set, an error message was thrown, reject promise and return error
                if (output !== "") {
                    reject({ success: false, message: output } as Types.Result)
                }

                // Get all files
                let dir: string = path.dirname(filePath);
                let files: Array<string> = fs.readdirSync(dir);
                let pages: Array<string> = files.filter((item) => {
                    return (item.startsWith('file') && item.endsWith('png'));
                });

                // Resove Promise and retunr pages
                resolve({ success: true, data: pages } as Types.Result)
            } catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error } as Types.Result);
                return;
            }
        });
    }

    /**
     * Creates a DataUrl representation from the png files provided.
     * @param filePaths An array containing the paths to the png files
     * @returns Returns a Promise of type [[Types.Result]] which contains an array with the DataUrl representation of the images if resolved, or the error message if rejected.
     */
    public getDataUrl(filePaths: Array<string>): Promise<Types.Result> {
        return new Promise((reject, resolve) => {
            try {
                // Prepare array for result
                let files: Array<string> = new Array<string>();

                // Iterate over all entries
                for (let i: number = 0, filePath: string; filePath = filePaths[i]; i++) {
                    // Set data prefix
                    let dataPrefix: string = 'data:image/png;base64,';

                    // Get file data as base64 encoded string
                    let data: string = fs.readFileSync(filePath).toString('base64');

                    // Add both to array
                    files.push(`${dataPrefix}${data}`);
                }

                resolve({ success: true, data: files } as Types.Result);
            } catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error } as Types.Result);
                return;
            }
        });
    }
}