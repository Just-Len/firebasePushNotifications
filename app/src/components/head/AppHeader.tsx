import React from "react";
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonMenuButton } from "@ionic/react";
import NotificationIcon from "../notification/notificationicon";
import "../notification/notificationicon.css";

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, showBackButton = false, showMenuButton = false }) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot='start'>
          {showBackButton && <IonBackButton defaultHref='/' />}
          {showMenuButton && <IonMenuButton />}
        </IonButtons>

        <IonTitle>{title}</IonTitle>

        <IonButtons slot='end'>
          <NotificationIcon />
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppHeader;
