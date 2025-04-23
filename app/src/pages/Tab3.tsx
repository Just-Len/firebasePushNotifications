import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonButton,
  IonTextarea
 } from '@ionic/react';

import {db} from '../Services/firebase/config/firebaseConfig'
import { useEffect, useState } from 'react';
import './Tab3.css';
import axios from 'axios'

const Tab3: React.FC = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [toastMessage, setToastMessage] = useState('');


  // Para la prueba, se usa la ip local, asi el telefono puede acceder a los dispositivos
  useEffect(() => {
  axios.get('http://192.168.0.9:3000/api/device-tokens')
    .then(response => {
      console.log("Tokens recibidos:", response.data);
      const validTokens = response.data.tokens.filter((t: any) => !!t.token);
      setTokens(validTokens);
    })
    .catch(error => {
      console.log('Error cargando tokens', error)
      alert('Error cargando tokens:' + error);
    });
}, []);


  const sendNotification = () => {
    if (!selectedToken || !title || !body) {
      setToastMessage('Completa todos los campos');
      return;
    }

    axios.post('http://192.168.0.9:3000/api/send-notification', {
      token: selectedToken,
      title,
      body,
    })
    .then(response => {
      setToastMessage('Notificación enviada con éxito');
    })
    .catch(error => {
      console.error('Error enviando notificación:', error);
      setToastMessage('Error al enviar notificación');
    });
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Enviar Notificación</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {tokens.map((tokenData, index) => (
            <IonItem key={index} button onClick={() => setSelectedToken(tokenData.token)} color={selectedToken === tokenData.token ? 'primary' : ''}>
              <IonLabel>{tokenData.uid}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonInput placeholder="Título" value={title} onIonChange={e => setTitle(e.detail.value!)} />
        <IonTextarea placeholder="Mensaje" value={body} onIonChange={e => setBody(e.detail.value!)} />

        <IonButton expand="block" onClick={sendNotification}>Enviar</IonButton>
        <IonButton expand="block" color="medium" onClick={() => { setTitle(''); setBody(''); }}>Cancelar</IonButton>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );

};

export default Tab3;
