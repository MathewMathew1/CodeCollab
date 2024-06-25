"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullCPlus = exports.pullZig = exports.pullNodeTypescript = exports.pullJava = exports.pullCSharp = exports.pullPython = exports.pullNode = void 0;
const pullNode = async (docker) => {
    await docker.pull("node:latest", (err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullNode = pullNode;
const pullPython = async (docker) => {
    await docker.pull("python:latest", (_err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullPython = pullPython;
const pullCSharp = async (docker) => {
    await docker.pull("mcr.microsoft.com/dotnet/sdk:latest", (_err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullCSharp = pullCSharp;
const pullJava = async (docker) => {
    await docker.pull("openjdk:latest", (_err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullJava = pullJava;
const pullNodeTypescript = async (docker) => {
    await new Promise((resolve, reject) => {
        docker.pull("node-ts:latest", (err, stream) => {
            if (err) {
                return reject(err);
            }
            docker.modem.followProgress(stream, (err, output) => {
                if (err) {
                    return reject(err);
                }
                resolve(output);
            });
        });
    });
};
exports.pullNodeTypescript = pullNodeTypescript;
const pullZig = async (docker) => {
    await docker.pull("zigbee2mqtt/zigbee2mqtt-amd64t", (_err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullZig = pullZig;
const pullCPlus = async (docker) => {
    await docker.pull("gcc:latest", (_err, stream) => {
        docker.modem.followProgress(stream, onFinished, onProgress);
        function onFinished(err, output) {
            if (err) {
                console.error("Error pulling image:", err);
                return;
            }
            console.log("Image pulled successfully");
        }
        function onProgress(event) {
            console.log("Progress:", event);
        }
    });
};
exports.pullCPlus = pullCPlus;
