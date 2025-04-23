// src/pages/FirebaseStatus.tsx

import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonSpinner, IonText } from "@ionic/react";
import React, { useEffect, useState } from "react";

interface FirebaseStatus {
  initialized: boolean;
  error: string | null;
}

const FirebaseStatus: React.FC = () => {
  const [status, setStatus] = useState<FirebaseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://10.0.2.2:3000/api/firebase-status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener estado de Firebase:", err);
        setStatus({ initialized: false, error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <>
      {loading ? (
        <IonSpinner name='dots' />
      ) : (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Firebase está {status?.initialized ? "inicializado ✅" : "no inicializado ❌"}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color={status?.error ? "danger" : "success"}>{status?.error ? `Error: ${status.error}` : "Sin errores 👍"}</IonText>
          </IonCardContent>
        </IonCard>
      )}
    </>
  );
};

export default FirebaseStatus;
