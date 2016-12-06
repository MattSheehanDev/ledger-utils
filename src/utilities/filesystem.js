"use strict";
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');
var FileSystem;
(function (FileSystem) {
    function FlattenPathTree(tree) {
        let flat = { files: [], dirs: [] };
        if (!tree.node.isDir) {
            flat.files.push(tree.node.path);
            return flat;
        }
        flat.dirs.push(tree.node.path);
        for (let file of tree.files) {
            flat.files.push(file);
        }
        for (let dir of tree.dirs) {
            let flatDir = FlattenPathTree(dir);
            flat.files = flat.files.concat(flatDir.files);
            flat.dirs = flat.dirs.concat(flatDir.dirs);
        }
        return flat;
    }
    FileSystem.FlattenPathTree = FlattenPathTree;
})(FileSystem || (FileSystem = {}));
var FileSystem;
(function (FileSystem) {
    var Async;
    (function (Async) {
        function ReadDirRecursive(dir) {
            let read = ReadDir(dir);
            read = read.then((files) => {
                let tree = {
                    node: {
                        path: dir,
                        isDir: true
                    },
                    files: [],
                    dirs: []
                };
                let dirFiles = [];
                let dirSubdirs = [];
                let statPromises = [];
                for (let file of files) {
                    let filePath = path.join(dir, file);
                    let fileStats = FileStats(filePath).then((stats) => {
                        if (stats.isDirectory()) {
                            dirSubdirs.push(filePath);
                        }
                        else {
                            dirFiles.push(filePath);
                        }
                    });
                    statPromises.push(fileStats);
                }
                return Promise.all(statPromises).then(() => {
                    for (let file of dirFiles) {
                        tree.files.push(file);
                    }
                    var promises = [];
                    for (let dir of dirSubdirs) {
                        promises.push(ReadDirRecursive(dir));
                    }
                    return Promise.all(promises).then((structs) => {
                        if (structs && structs.length) {
                            for (let t of structs) {
                                tree.dirs.push(t);
                            }
                        }
                        return tree;
                    });
                });
            });
            return read;
        }
        Async.ReadDirRecursive = ReadDirRecursive;
        function ReadDir(dir) {
            return new Promise((resolve, reject) => {
                fs.readdir(dir, (err, files) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(files);
                    }
                });
            });
        }
        Async.ReadDir = ReadDir;
        function MakeDir(dir) {
            return new Promise((resolve, reject) => {
                fs.mkdir(dir, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        Async.MakeDir = MakeDir;
        function TryMakeDir(dir) {
            return new Promise((resolve, reject) => {
                MakeDir(dir).then(() => {
                    resolve();
                }, () => {
                    resolve();
                });
            });
        }
        Async.TryMakeDir = TryMakeDir;
        function FileStats(path) {
            return new Promise((resolve, reject) => {
                fs.stat(path, (err, stats) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(stats);
                    }
                });
            });
        }
        Async.FileStats = FileStats;
        function ReadFile(path) {
            return new Promise((resolve, reject) => {
                fs.readFile(path, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if (Buffer.isBuffer(data)) {
                            resolve(data.toString());
                        }
                        else {
                            resolve(data);
                        }
                    }
                });
            });
        }
        Async.ReadFile = ReadFile;
        function TryReadFile(path) {
            return new Promise((resolve, reject) => {
                ReadFile(path).then((data) => {
                    resolve(data);
                }, (err) => {
                    resolve(null);
                });
            });
        }
        Async.TryReadFile = TryReadFile;
        function WriteFile(path, data) {
            return new Promise((resolve, reject) => {
                fs.writeFile(path, data, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        Async.WriteFile = WriteFile;
        function AppendFile(path, data) {
            return new Promise((resolve, reject) => {
                fs.appendFile(path, data, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        Async.AppendFile = AppendFile;
        function RemoveDirRecursive(path) {
            let readDir = ReadDirRecursive(path);
            readDir = readDir.then((tree) => {
                return removeDirs(tree);
            });
            return readDir;
        }
        Async.RemoveDirRecursive = RemoveDirRecursive;
        function removeDirs(tree) {
            if (!tree.node.isDir) {
                throw "Not a directory";
            }
            let removing = [];
            for (let file of tree.files) {
                removing.push(RemoveFile(file));
            }
            for (let dir of tree.dirs) {
                removing.push(removeDirs(dir));
            }
            let whenDirs = Promise.all(removing);
            whenDirs = whenDirs.then(() => {
                return RemoveDir(tree.node.path);
            });
            return whenDirs;
        }
        function RemoveDir(path) {
            return new Promise((resolve, reject) => {
                fs.rmdir(path, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        Async.RemoveDir = RemoveDir;
        function RemoveFilesRecursive(dir, exts) {
            let extensions;
            if (Array.isArray(exts))
                extensions = exts;
            else if (typeof exts == 'string')
                extensions = [exts];
            let readDir = ReadDirRecursive(dir);
            readDir = readDir.then((tree) => {
                let flatten = FileSystem.FlattenPathTree(tree);
                let files;
                if (extensions) {
                    files = [];
                    for (let ext of extensions) {
                        let reg = helpers.globToRegex(ext);
                        files = flatten.files.filter((file) => {
                            let name = path.basename(file);
                            let match = reg.test(name);
                            return match;
                        }).concat(files);
                    }
                }
                else {
                    files = flatten.files;
                }
                let removing = [];
                for (let file of files) {
                    removing.push(RemoveFile(file));
                }
                return Promise.all(removing);
            });
            return readDir;
        }
        Async.RemoveFilesRecursive = RemoveFilesRecursive;
        function RemoveFile(path) {
            return new Promise((resolve, reject) => {
                fs.unlink(path, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        Async.RemoveFile = RemoveFile;
        function TryRemoveFile(path) {
            return new Promise((resolve, reject) => {
                RemoveFile(path).then(() => {
                    resolve();
                }, (err) => {
                    resolve();
                });
            });
        }
        Async.TryRemoveFile = TryRemoveFile;
    })(Async = FileSystem.Async || (FileSystem.Async = {}));
})(FileSystem || (FileSystem = {}));
module.exports = FileSystem;
//# sourceMappingURL=filesystem.js.map