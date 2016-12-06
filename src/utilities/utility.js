"use strict";
function isUndefinedOrNull(obj) {
    return obj === undefined || obj === null;
}
exports.isUndefinedOrNull = isUndefinedOrNull;
function isUndefined(obj) {
    return obj === undefined;
}
exports.isUndefined = isUndefined;
function isNull(obj) {
    return obj === null;
}
exports.isNull = isNull;
function Round(val, len) {
    len = Math.pow(10, len);
    return Math.round(val * len) / len;
}
exports.Round = Round;
function Pad(val, len) {
    var negative = val < 0;
    var str = Math.abs(val).toString();
    var decimal = str.indexOf(".");
    if (decimal < 0) {
        while (str.length < len) {
            str = "0" + str;
        }
    }
    else {
        len += 1;
        if (decimal == 0) {
            str = "0" + str;
        }
        while (str.length < len) {
            str = str + "0";
        }
    }
    str = str.substr(0, len);
    if (negative) {
        str = "-" + str;
    }
    return str;
}
exports.Pad = Pad;
function SplitOnWhitespace(s) {
    const WhiteSpaceRegEx = /\s/g;
    return s.split(WhiteSpaceRegEx);
}
exports.SplitOnWhitespace = SplitOnWhitespace;
