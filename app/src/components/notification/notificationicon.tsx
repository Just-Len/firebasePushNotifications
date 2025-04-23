import React, { useEffect, useState } from "react";
import { IonIcon, IonBadge, IonPopover, IonList, IonItem, IonLabel, IonButton } from "@ionic/react";
import { checkmarkDone, trash, notificationsOutline } from "ionicons/icons";
import NotificationService from "../../Services/nofication";
import { auth, authReady } from "../../Services/firebase/config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const NotificationIcon: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    authReady.then(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          notificationService.initialize(user.uid);
        }
      });
      // Actualizar el estado cuando cambien las notificaciones
      const removeListener = notificationService.addListener(() => {
        setUnreadCount(notificationService.getUnreadCount());
        setNotifications(notificationService.getNotifications());
      });

      // Cargar estado inicial
      setUnreadCount(notificationService.getUnreadCount());
      setNotifications(notificationService.getNotifications());

      return () => {
        unsubscribe();
        removeListener();
      };
    });
  }, [authReady]);

  const presentPopover = (e: React.MouseEvent) => {
    e.persist();
    setPopoverEvent(e.nativeEvent);
    setShowPopover(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  return (
    <>
      <div className='notification-icon-container' onClick={presentPopover}>
        <IonIcon icon={notificationsOutline} size='large' />
        {unreadCount > 0 && (
          <IonBadge color='danger' className='notification-badge'>
            {unreadCount}
          </IonBadge>
        )}
      </div>

      <IonPopover event={popoverEvent} isOpen={showPopover} onDidDismiss={() => setShowPopover(false)} className='notifications-popover'>
        <div className='notifications-header'>
          <h4>Notificaciones</h4>
          {unreadCount > 0 && (
            <IonButton fill='clear' size='small' onClick={handleMarkAllAsRead}>
              <IonIcon slot='icon-only' icon={checkmarkDone} />
            </IonButton>
          )}
        </div>

        <IonList className='notifications-list'>
          {notifications.length === 0 ? (
            <IonItem lines='none'>
              <IonLabel className='ion-text-center'>No tienes notificaciones</IonLabel>
            </IonItem>
          ) : (
            notifications.map((notification) => (
              <IonItem key={notification.id} className={notification.read ? "notification-read" : "notification-unread"}>
                <div className='notification-item'>
                  <h2>{notification.title}</h2>
                  <p>{notification.body}</p>
                  <small>{formatDate(notification.date)}</small>

                  <div className='notification-actions'>
                    {!notification.read && (
                      <IonButton fill='clear' size='small' onClick={() => handleMarkAsRead(notification.id)}>
                        <IonIcon slot='icon-only' icon={checkmarkDone} />
                      </IonButton>
                    )}
                    <IonButton fill='clear' size='small' color='danger' onClick={() => handleDeleteNotification(notification.id)}>
                      <IonIcon slot='icon-only' icon={trash} />
                    </IonButton>
                  </div>
                </div>
              </IonItem>
            ))
          )}
        </IonList>
      </IonPopover>
    </>
  );
};

export default NotificationIcon;
