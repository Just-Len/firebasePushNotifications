import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import "./Home.css";
import AppHeader from "../components/head/AppHeader";
import FirebaseStatus from "../components/cargarServicio";

const Home: React.FC = () => {
  return (
    <IonPage>
      <AppHeader title='Home - Notifaciones' showMenuButton={true} />
      <IonContent fullscreen>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>Home</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
      <h1>Home</h1>
      <FirebaseStatus />
    </IonPage>
  );
};

export default Home;
