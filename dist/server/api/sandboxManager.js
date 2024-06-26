"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInSandbox = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const dockerodeHelper_1 = require("../../utilis/dockerodeHelper");
async function runInSandbox(files, filenameToRun, folders) {
    const docker = new dockerode_1.default();
    const extension = (0, dockerodeHelper_1.getExtensionFromFilename)(filenameToRun);
    const imageAndCommand = (0, dockerodeHelper_1.imageAndCommandFromExtension)(extension);
    const container = await docker.createContainer({
        Image: imageAndCommand.image, // Use the custom Docker image
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        HostConfig: {
            Binds: ["/var/run/docker.sock:/var/run/docker.sock"], // Bind Docker socket
        },
    });
    try {
        await container.start();
        await container.exec({
            Cmd: ["sh", "-c", `mkdir -p "/app/"`],
        });
        for (const folder of folders) {
            const folderPath = folder.path
                ? `${folder.path}/${folder.name}`
                : folder.name;
            await (await container.exec({
                Cmd: ["sh", "-c", `mkdir -p "/app/${folderPath}"`],
            })).start({});
        }
        for (const file of files) {
            const filePath = file.path ? `/app/${file.path}` : `/app/${file.name}`;
            await (await container.exec({
                Cmd: [
                    "sh",
                    "-c",
                    `echo '${file.content.replace(/'/g, "'\\''")}' > "${filePath}"`,
                ],
            })).start({});
        }
        const exec = await container.exec({
            AttachStdout: true,
            AttachStderr: false,
            Tty: false,
            Cmd: [
                "sh",
                "-c",
                `cd /app && ${imageAndCommand.command(filenameToRun)}`,
            ],
        });
        const stream = await exec.start({});
        let output = "";
        await new Promise((resolve, reject) => {
            container.modem.demuxStream(stream, process.stdout, process.stderr);
            stream.on("data", (chunk) => {
                const utfString = chunk.toString("utf-8");
                console.log({ b: utfString });
                output += chunk
                    .toString("utf-8")
                    .replace(/[^\x20-\x7E\x1b\x5B\x6D\x5D\x07\x09\x0A\x0D\x0B]/g, ""); // Remove non-printable characters
            });
            stream.on("end", resolve);
            stream.on("error", (chunk) => {
                const utfString = chunk.toString("utf-8");
                console.log({ b: utfString });
                output += chunk
                    .toString("utf-8")
                    .replace(/[^\x20-\x7E\x1b\x5B\x6D\x5D\x07\x09\x0A\x0D\x0B]/g, ""); // Remove non-printable characters
                reject;
            });
        });
        // container.stop();
        //container.remove({ force: true });
        return output;
    }
    catch (error) {
        console.error("Error running code in sandbox:", error);
        container.remove({ force: true });
        throw error;
    }
}
exports.runInSandbox = runInSandbox;
