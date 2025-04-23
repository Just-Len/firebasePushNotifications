import { PushNotifications } from '@capacitor/push-notifications';

import { savePushToken } from '../Services/firebase/notification';


class NotificationService {
  private static instance: NotificationService;
  private listeners: Function[] = [];
  private notifications: any[] = [];

  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Inicializar el servicio de notificaciones
  async initialize(uid: string) {
    await this.initializeNative(uid);

    this.loadSavedNotifications();
  }
 

  // Inicializar para dispositivos nativos
  private async initializeNative(uid: string) {
    try {
       
      // Solicitar permiso para notificaciones push
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Registrar para recibir notificaciones push
        await PushNotifications.register();
        
        // Escuchar por eventos de notificaciones push
        PushNotifications.addListener('registration', (token) => {
          savePushToken( token.value, uid);          
        });
        
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notificación recibida:', notification);
          this.addNotification(notification);
          this.notifyListeners();
        });
        
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Acción realizada en notificación:', notification);
          this.addNotification(notification.notification);
          this.notifyListeners();
        });
      }
    } catch (error) {
      alert('Error al inicializar notificaciones nativas:');
    }
  }

  // Añadir notificación a la lista
  private addNotification(notification: any) {
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title || 'Sin título',
      body: notification.body || '',
      data: notification.data || {},
      read: false,
      date: new Date().toISOString()
    };
    
    this.notifications = [newNotification, ...this.notifications];
    this.saveNotifications();
  }

  // Guardar notificaciones en localStorage
  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  // Cargar notificaciones guardadas
  private loadSavedNotifications() {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        this.notifications = JSON.parse(saved);
      } catch (e) {
        this.notifications = [];
      }
    }
  }

  // Obtener todas las notificaciones
  getNotifications() {
    return [...this.notifications];
  }

  // Obtener cantidad de notificaciones no leídas
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Marcar notificación como leída
  markAsRead(id: string) {
    this.notifications = this.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications();
    this.notifyListeners();
  }

  // Marcar todas las notificaciones como leídas
  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
    this.notifyListeners();
  }

  // Eliminar notificación
  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
  }

  // Añadir listener para cambios en notificaciones
  addListener(listener: Function) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar a todos los listeners sobre cambios
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

}

export default NotificationService;