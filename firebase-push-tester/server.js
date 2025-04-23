const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Variables para el estado de Firebase
let firebaseInitialized = false;
let firebaseError = null;

// Función para inicializar Firebase Admin
function initializeFirebase(credentials) {
  try {
    // Si ya está inicializado, no hacer nada
    if (admin.apps.length > 0) {
      return true;
    }

    if (credentials) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials)
      });
      
      console.log('Firebase Admin inicializado correctamente');
      firebaseInitialized = true;
      firebaseError = null;
      return true;
    } else {
      throw new Error('No se proporcionaron credenciales válidas');
    }
  } catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
    firebaseError = error.message;
    firebaseInitialized = false;
    return false;
  }
}

// Intentar inicializar Firebase con diferentes métodos
function tryInitializeFirebase() {
  // Método 1: Intentar cargar desde serviceAccountKey.json
  try {
    if (fs.existsSync('./serviceAccountKey.json')) {
      const serviceAccount = require('./serviceAccountKey.json');
      return initializeFirebase(serviceAccount);
    }
  } catch (e) {
    console.log('No se encontró archivo serviceAccountKey.json');
  }

  // Método 2: Intentar usar variables de entorno
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeFirebase(credentials);
    } catch (e) {
      console.log('Error al analizar FIREBASE_SERVICE_ACCOUNT:', e);
    }
  }

  console.log('No se pudo inicializar Firebase. Por favor, configura las credenciales en la interfaz web.');
  return false;
}

// Intento inicial de inicialización
tryInitializeFirebase();

// Endpoint para configurar Firebase manualmente
app.post('/api/configure-firebase', (req, res) => {
  try {
    const { credentials } = req.body;
    
    if (!credentials) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron credenciales'
      });
    }
    
    // Guardar las credenciales en un archivo
    fs.writeFileSync('./serviceAccountKey.json', JSON.stringify(credentials, null, 2));
    
    // Inicializar Firebase con las nuevas credenciales
    if (initializeFirebase(credentials)) {
      res.status(200).json({
        success: true,
        message: 'Firebase configurado correctamente'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al inicializar Firebase con las credenciales proporcionadas',
        error: firebaseError
      });
    }
  } catch (error) {
    console.error('Error al configurar Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Error al configurar Firebase',
      error: error.message
    });
  }
});

// Middleware para verificar si Firebase está inicializado
const checkFirebaseInitialized = (req, res, next) => {
  if (firebaseInitialized) {
    next();
  } else {
    res.status(503).json({
      success: false,
      message: 'Firebase no está inicializado. Configura las credenciales primero.',
      error: firebaseError
    });
  }
};

// Endpoint para enviar notificaciones
app.post('/api/send-notification', checkFirebaseInitialized, async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    if (!token || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren token, título y cuerpo del mensaje' 
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token
    };
    console.log('Enviando notificación a:', token);
    const response = await admin.messaging().send(message);
    console.log('Notificación enviada exitosamente:', response);
    
    res.status(200).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      messageId: response
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación',
      error: error.message
    });
  }
});

// Endpoint para enviar notificación a un tema (topic)
app.post('/api/send-topic-notification', checkFirebaseInitialized, async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;
    
    if (!topic || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren topic, título y cuerpo del mensaje' 
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      topic
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación al tema enviada exitosamente:', response);
    
    res.status(200).json({
      success: true,
      message: `Notificación enviada exitosamente al tema ${topic}`,
      messageId: response
    });
  } catch (error) {
    console.error('Error al enviar notificación al tema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación al tema',
      error: error.message
    });
  }
});

// Endpoint para enviar notificación a múltiples tokens
app.post('/api/send-multicast', checkFirebaseInitialized, async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;
    
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Se requieren tokens (array), título y cuerpo del mensaje' 
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: data || {},
      tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Notificación enviada a ${response.successCount} dispositivos de ${tokens.length}`);
    
    res.status(200).json({
      success: true,
      message: `Notificación enviada a ${response.successCount} dispositivos de ${tokens.length}`,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    });
  } catch (error) {
    console.error('Error al enviar notificaciones múltiples:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificaciones múltiples',
      error: error.message
    });
  }
});

// Endpoint para verificar el estado de Firebase
app.get('/api/firebase-status', (req, res) => {
  res.json({
    initialized: firebaseInitialized,
    error: firebaseError
  });
});

// Endpooint para listar todos los tokens guardados
app.get('/api/device-tokens', checkFirebaseInitialized, async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('deviceTokens').get();

    const tokens = [];
    snapshot.forEach(doc => {
      tokens.push({
        uid: doc.id,
        token: doc.data().token,
        updatedAt: doc.data().updatedAt,
      });
    });

    res.status(200).json({
      success: true,
      tokens,
    });
  } catch (error) {
    console.error('Error al obtener los tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tokens',
      error: error.message,
    });
  }
});
 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port,'0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});