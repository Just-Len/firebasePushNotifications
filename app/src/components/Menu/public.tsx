import { IonIcon, IonLabel, IonTabBar, IonTabButton } from "@ionic/react";
import { logInOutline } from "ionicons/icons";
export const MenuLoggedOut = () => {
  return (
    <IonTabBar slot='bottom'>
      <IonTabButton tab='login' href='/login'>
        <IonIcon aria-hidden='true' icon={logInOutline} />
        <IonLabel>Login</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};
