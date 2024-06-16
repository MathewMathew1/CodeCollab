import Docker from "dockerode";

export const pullNode = async (docker: Docker) => {
  await docker.pull(
    "node:latest",
    (err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};

export const pullPython = async (docker: Docker) => {
  await docker.pull(
    "python:latest",
    (_err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};

export const pullCSharp = async (docker: Docker) => {
  await docker.pull(
    "mcr.microsoft.com/dotnet/sdk:latest",
    (_err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};

export const pullJava = async (docker: Docker) => {
  await docker.pull(
    "openjdk:latest",
    (_err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};


export const pullNodeTypescript = async (docker: Docker) => {
  await new Promise((resolve, reject) => {
    docker.pull("node-ts:latest", (err: any, stream: NodeJS.ReadableStream) => {
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

export const pullZig = async (docker: Docker) => {
  await docker.pull(
    "zigbee2mqtt/zigbee2mqtt-amd64t",
    (_err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};

export const pullCPlus = async (docker: Docker) => {
  await docker.pull(
    "gcc:latest",
    (_err: any, stream: NodeJS.ReadableStream) => {
      docker.modem.followProgress(stream, onFinished, onProgress);

      function onFinished(err: any, output: any) {
        if (err) {
          console.error("Error pulling image:", err);
          return;
        }

        console.log("Image pulled successfully");
      }

      function onProgress(event: any) {
        console.log("Progress:", event);
      }
    },
  );
};


