import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";

// Used to call TRPC procedures from the pages/api folder

const systemContext = {
  session: {
    user: {
      id: "-1",
      email: "@admin",
      role: "system",
    },
    expires: new Date(`${new Date().getFullYear() + 2}-01-01`).toISOString(),
  },
  db,
};

export const deviceCaller = appRouter.device.createCaller(systemContext);
export const faceRecognitionCaller = appRouter.face_recognition.createCaller(systemContext);
export const sendDataCaller = appRouter.sendData.createCaller(systemContext);
export const sensorsCaller = appRouter.sensors.createCaller(systemContext);