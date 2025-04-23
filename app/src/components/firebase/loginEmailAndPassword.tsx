import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { IonInput, IonButton, IonItem, IonLabel, IonText, IonLoading } from "@ionic/react";
import { auth, authReady } from "../../Services/firebase/config/firebaseConfig";

const LoginEmailAndPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authReady;
      await signInWithEmailAndPassword(auth, email, password).then(() => {
        
        history.replace("/home");
      });
    } catch (error: any) {
       
      setError(error.message);
    }
    setLoading(false);
  };

  if (loading) {
    return <IonLoading isOpen message='Cargando sesión...' />;
  }

  return (
    <>
      <form onSubmit={handleLogin}>
        <IonItem>
          <IonLabel position='floating'>Email</IonLabel>
          <IonInput type='email' value={email} onIonChange={(e) => setEmail(e.detail.value!)} required />
        </IonItem>
        <IonItem>
        
          <IonLabel position='floating'>Password</IonLabel>
          <IonInput type='password' value={password} onIonChange={(e) => setPassword(e.detail.value!)} required />
        </IonItem>
        {error && (
          <IonText color='danger'>
            <p>{error}</p>
          </IonText>
        )}
        <IonButton expand='block' type='submit'>
          Login
        </IonButton>
      </form>
    </>
  );
};

export default LoginEmailAndPassword;
