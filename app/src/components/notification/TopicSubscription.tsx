import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonToast,
} from '@ionic/react';
import {  getToken } from 'firebase/messaging';
import {  doc, setDoc, getDoc } from 'firebase/firestore';
import { PushNotifications } from '@capacitor/push-notifications';
import { db, messaging } from '../../Services/firebase/config/firebaseConfig';

// Define la interfaz para los tópicos
interface Topic {
  id: string;
  name: string;
  subscribed: boolean;
}

const TopicSubscription: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([
    { id: 'sports', name: 'Deportes', subscribed: false },
    { id: 'challenges', name: 'Nuevos Retos', subscribed: false },
  ]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    initializePushNotifications();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Solicitar permisos
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        // Registrar para notificaciones push
        await PushNotifications.register();
        
        // Obtener FCM token
        const token = await getToken(messaging);
        setFcmToken(token);
        
        // Cargar suscripciones existentes
        await loadUserSubscriptions(token);
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const loadUserSubscriptions = async (token: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', token));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTopics(prevTopics => 
          prevTopics.map(topic => ({
            ...topic,
            subscribed: userData.topics?.includes(topic.id) || false
          }))
        );
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleToggle = async (topicId: string) => {
    if (!fcmToken) {
      setToastMessage('Error: No se pudo obtener el token de registro');
      setShowToast(true);
      return;
    }

    try {
      const updatedTopics = topics.map(topic => {
        if (topic.id === topicId) {
          return { ...topic, subscribed: !topic.subscribed };
        }
        return topic;
      });

      // Actualizar estado local
      setTopics(updatedTopics);

      // Guardar en Firestore
      await setDoc(doc(db, 'users', fcmToken), {
        topics: updatedTopics.filter(t => t.subscribed).map(t => t.id),
        token: fcmToken,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      const topic = updatedTopics.find(t => t.id === topicId);
      setToastMessage(`${topic?.subscribed ? 'Suscrito a' : 'Desuscrito de'} ${topic?.name}`);
      setShowToast(true);

    } catch (error) {
      console.error('Error updating subscription:', error);
      setToastMessage('Error al actualizar la suscripción');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Suscripción a Temas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {topics.map((topic) => (
            <IonItem key={topic.id}>
              <IonLabel>{topic.name}</IonLabel>
              <IonToggle
                checked={topic.subscribed}
                onIonChange={() => handleToggle(topic.id)}
              />
            </IonItem>
          ))}
        </IonList>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default TopicSubscription;