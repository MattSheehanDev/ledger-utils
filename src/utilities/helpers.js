"use strict";
const path = require('path');
var Helpers;
(function (Helpers) {
    function isBlank(obj) {
        return obj == null || obj == undefined;
    }
    Helpers.isBlank = isBlank;
    function normalizePath(p) {
        return p.split(path.posix.sep).join(path.posix.sep).split(path.win32.sep).join(path.posix.sep);
    }
    Helpers.normalizePath = normalizePath;
    function ext(p) {
        let basename = path.basename(p);
        let dotIndex = basename.indexOf('.');
        if (dotIndex) {
            return basename.substr(dotIndex, basename.length - dotIndex);
        }
        return '';
    }
    Helpers.ext = ext;
    function globToRegex(g) {
        let reg = g.replace(/\./g, '\\.');
        reg = reg.replace(/\*/g, '(?:.)*');
        reg = `^${reg}$`;
        return new RegExp(reg);
    }
    Helpers.globToRegex = globToRegex;
})(Helpers || (Helpers = {}));
module.exports = Helpers;
//# sourceMappingURL=helpers.js.map