import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { useHistory } from "react-router-dom";
import { useCallback, useState } from "react";
import { IonButton, IonIcon, IonLoading } from "@ionic/react";
import { auth, authReady } from "../../Services/firebase/config/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

const HandleGoogleSignIn = () => {
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (result?.user) {
        await authReady;
        const credential = await GoogleAuthProvider.credential(result.credential?.idToken);

        await signInWithCredential(auth, credential).then(() => {
          setLoading(false);
          history.push("/home");
        });
      } else {
        setLoading(false);
        alert("El inicio de sesión con Google falló o fue cancelado.");
      }
    } catch (error: any) {
      setLoading(false);
      alert("Error durante el inicio de sesión con Google: " + error.message);
    }
  }, [history]);

  if (loading) {
    return <IonLoading isOpen message='Cargando sesión...' />;
  }

  return (
    <IonButton onClick={signInWithGoogle} expand='block'>
      <IonIcon slot='start' name='logo-google'></IonIcon>
      Iniciar sesión con Google
    </IonButton>
  );
};

export default HandleGoogleSignIn;
