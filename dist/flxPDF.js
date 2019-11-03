"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const Types_1 = require("./Types");
const uuid = require("uuid/v4");
class flxPDF {
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
    writeFile(data, mode) {
        return new Promise((resolve, reject) => {
            try {
                let buffer;
                let tmpPath = path.join(__dirname, 'tmp', uuid());
                let fileName = `${uuid()}.pdf`;
                // Create tmp folder
                if (!fs.existsSync(tmpPath)) {
                    fs.mkdirSync(tmpPath, { recursive: true });
                }
                // Set Buffer or Copy data to tmp folder
                if (mode === Types_1.Types.Mode.ArrayBuffer) {
                    buffer = Buffer.from(data);
                }
                else if (mode === Types_1.Types.Mode.Base64) {
                    buffer = Buffer.from(data, 'base64');
                }
                else if (mode === Types_1.Types.Mode.Buffer) {
                    buffer = data;
                }
                else if (mode === Types_1.Types.Mode.File) {
                    fileName = path.basename(data);
                    fs.copyFileSync(data, path.join(tmpPath, fileName));
                    resolve({ success: true, data: path.join(tmpPath, fileName) });
                    return;
                }
                // Check if Buffer is set.
                if (!buffer) {
                    reject({ success: false, message: 'Buffer does not contain data, unable to write file.' });
                    return;
                }
                // Write data to tmp folder
                fs.writeFileSync(path.join(tmpPath, fileName), buffer, { flag: 'wx' });
                resolve({ success: true, data: path.join(tmpPath, fileName) });
                return;
            }
            catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error });
                return;
            }
        });
    }
    /**
     * Extracts the amount if pages of a given PDF file using ghostscript
     * @param filePath Path to the PDF file
     * @returns Returns a Promise of type [[Types.Result]] which contains the amount of pages if resolved, or the error message if rejected.
     */
    getPageCount(filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Setup gs command
                // https://stackoverflow.com/a/4829240/1828179
                let cmd = `${__dirname.split('\\').join('/')}/gs/gs.exe -q -dNODISPLAY -c "(${filePath.split('\\').join('/')}) (r) file runpdfbegin pdfpagecount = quit"`;
                // Execute GS command synchronous in child process
                let output = cp.execSync(cmd).toString();
                // Convert to number as this is the expected result
                let pageCount = Number(output);
                // If Not A Number, reject Promise and return output
                if (isNaN(pageCount)) {
                    reject({ success: false, message: output });
                    return;
                }
                // Resove Promise and retunr page cound
                resolve({ success: true, data: pageCount });
            }
            catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error });
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
    convertPages(filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Get dir name
                let dirName = path.dirname(filePath);
                // Setup gs command
                // https://stackoverflow.com/a/3379649/1828179
                let cmd = `${__dirname.split('\\').join('/')}/gs/gs.exe -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -o ${path.join(dirName, 'file-%d.png')} -r144 ${filePath.split('\\').join('/')}`;
                // Execute GS command synchronous in child process
                let output = cp.execSync(cmd).toString();
                // If output is set, an error message was thrown, reject promise and return error
                if (output !== "") {
                    reject({ success: false, message: output });
                }
                // Get all files
                let dir = path.dirname(filePath);
                let files = fs.readdirSync(dir);
                let pages = new Array();
                for (let i = 0, file; file = files[i]; i++) {
                    if (file.startsWith('file') && file.endsWith('png')) {
                        pages.push(path.join(dir, file));
                    }
                }
                // Resove Promise and retunr pages
                resolve({ success: true, data: pages });
            }
            catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error });
                return;
            }
        });
    }
    /**
     * Creates a DataUrl representation from the png files provided.
     * @param filePaths An array containing the paths to the png files
     * @returns Returns a Promise of type [[Types.Result]] which contains an array with the DataUrl representation of the images if resolved, or the error message if rejected.
     */
    getData(filePaths, mode) {
        return new Promise((resolve, reject) => {
            try {
                // Prepare array for result
                let files = new Array();
                // Iterate over all entries
                for (let i = 0, filePath; filePath = filePaths[i]; i++) {
                    let data;
                    if (mode === Types_1.Types.Mode.ArrayBuffer) {
                        data = new Uint8Array(fs.readFileSync(filePath));
                    }
                    else if (mode === Types_1.Types.Mode.Base64) {
                        data = fs.readFileSync(filePath).toString('base64');
                    }
                    else if (mode === Types_1.Types.Mode.Buffer) {
                        data = data = fs.readFileSync(filePath);
                    }
                    else if (mode === Types_1.Types.Mode.File) {
                        resolve({ success: true, data: filePaths });
                        return;
                    }
                    // Add both to array
                    files.push(data);
                }
                resolve({ success: true, data: files });
            }
            catch (error) {
                // In case something went wrong, reject promise and return error
                reject({ success: false, message: error });
                return;
            }
        });
    }
}
exports.flxPDF = flxPDF;
