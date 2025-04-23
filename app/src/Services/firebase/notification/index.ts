import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export const savePushToken = async (token: string,uid: string) => {
  try {
    await setDoc(doc(db, "deviceTokens", uid), {
      token: token,
      updatedAt: new Date(),
    });    
  } catch (error) {
    alert(`Error al guardar token: ${token}, con la uid: ${uid}`+ error);
  }
};

export const sendNotificationToUsers = async (uids: string[], title: string, body: string) => {
  try {
    const response = await fetch("https://TU_ENDPOINT/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uids,
        title,
        body
      })
    });

    const result = await response.json();
    console.log("Resultado de notificaciones:", result);
  } catch (error) {
    console.error("Error enviando notificaciones: ", error);
  }
};
