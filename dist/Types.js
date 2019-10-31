"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This module provides the types for [[flxPDF]]
 */
var Types;
(function (Types) {
    /**
     * Defines the modes in which the PDF file can be provided.
     */
    let Mode;
    (function (Mode) {
        Mode[Mode["ArrayBuffer"] = 0] = "ArrayBuffer";
        Mode[Mode["Base64"] = 1] = "Base64";
        Mode[Mode["Buffer"] = 2] = "Buffer";
        Mode[Mode["File"] = 3] = "File";
    })(Mode = Types.Mode || (Types.Mode = {}));
})(Types = exports.Types || (exports.Types = {}));
