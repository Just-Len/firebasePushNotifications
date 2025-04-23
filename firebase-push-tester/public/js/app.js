document.addEventListener('DOMContentLoaded', () => {
    // Verificar estado de Firebase al cargar
    checkFirebaseStatus();
    
    // Configuración de Firebase
    const firebaseConfigForm = document.getElementById('firebaseConfigForm');
    if (firebaseConfigForm) {
        firebaseConfigForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const serviceAccountText = document.getElementById('serviceAccount').value;
                let credentials;
                
                try {
                    credentials = JSON.parse(serviceAccountText);
                } catch (error) {
                    showResponse({
                        success: false,
                        message: 'Error al analizar JSON de credenciales',
                        error: 'El texto ingresado no es un JSON válido'
                    });
                    return;
                }
                
                showResponse({message: 'Configurando Firebase...'});
                
                const response = await fetch('/api/configure-firebase', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ credentials })
                });
                
                const result = await response.json();
                showResponse(result);
                
                if (result.success) {
                    // Recargar la página después de 2 segundos
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            } catch (error) {
                showResponse({
                    success: false,
                    message: 'Error al configurar Firebase',
                    error: error.message
                });
            }
        });
    }

    // Funcionalidad de las pestañas
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Actualizar botones activos
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar paneles activos
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // Formulario para un solo dispositivo
    const singleDeviceForm = document.getElementById('singleDeviceForm');
    if (singleDeviceForm) {
        singleDeviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await sendRequest('/api/send-notification', {
                token: document.getElementById('token').value,
                title: document.getElementById('title').value,
                body: document.getElementById('body').value,
                data: parseJsonField('data')
            });
        });
    }

    // Formulario para tema (topic)
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
        topicForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await sendRequest('/api/send-topic-notification', {
                topic: document.getElementById('topic').value,
                title: document.getElementById('topicTitle').value,
                body: document.getElementById('topicBody').value,
                data: parseJsonField('topicData')
            });
        });
    }

    // Formulario para múltiples dispositivos
    const multipleDevicesForm = document.getElementById('multipleDevicesForm');
    if (multipleDevicesForm) {
        multipleDevicesForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tokensText = document.getElementById('tokens').value;
            const tokens = tokensText.split('\n')
                .map(token => token.trim())
                .filter(token => token.length > 0);
                
            await sendRequest('/api/send-multicast', {
                tokens,
                title: document.getElementById('multiTitle').value,
                body: document.getElementById('multiBody').value,
                data: parseJsonField('multiData')
            });
        });
    }

    // Función para verificar el estado de Firebase
    async function checkFirebaseStatus() {
        try {
            const banner = document.getElementById('firebaseStatusBanner');
            const configSection = document.getElementById('firebaseConfigSection');
            const mainContent = document.getElementById('mainContent');
            
            console.log('Verificando estado de Firebase...');
            
            const response = await fetch('/api/firebase-status');
            console.log('Respuesta recibida:', response.status);
            
            const status = await response.json();
            console.log('Estado de Firebase:', status);
            
            if (status.initialized) {
                // Firebase está configurado
                banner.className = 'status-banner success';
                banner.innerHTML = '<i class="fas fa-check-circle"></i> Firebase configurado correctamente';
                
                configSection.style.display = 'none';
                mainContent.style.display = 'block';
                
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 3000);
            } else {
                // Firebase no está configurado
                banner.className = 'status-banner warning';
                banner.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Firebase no está configurado. Por favor, ingresa tus credenciales.';
                
                configSection.style.display = 'block';
                mainContent.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al verificar estado de Firebase:', error);
            const banner = document.getElementById('firebaseStatusBanner');
            banner.className = 'status-banner error';
            banner.innerHTML = '<i class="fas fa-times-circle"></i> Error al conectar con el servidor';
            
            // Mostrar el formulario de configuración en caso de error
            document.getElementById('firebaseConfigSection').style.display = 'block';
        }
    }

    // Función para enviar solicitudes a la API
    async function sendRequest(endpoint, data) {
        const responseElement = document.getElementById('response');
        
        try {
            responseElement.textContent = 'Enviando...';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            // Mostrar respuesta
            showResponse(result);
            
            // Añadir al historial
            if (endpoint.includes('send')) {
                addToHistory({
                    title: data.title,
                    body: data.body,
                    target: data.token ? 'Un dispositivo' : 
                            data.topic ? `Tema: ${data.topic}` : 
                            `${data.tokens.length} dispositivos`,
                    success: result.success,
                    message: result.message,
                    timestamp: new Date().toLocaleString()
                });
            }
            
        } catch (error) {
            showResponse({
                success: false,
                message: `Error: ${error.message}`,
                error: error.toString()
            });
        }
    }

    // Mostrar respuesta en el elemento de respuesta
    function showResponse(result) {
        const responseElement = document.getElementById('response');
        responseElement.textContent = JSON.stringify(result, null, 2);
    }

    // Función para añadir elementos al historial
    function addToHistory(item) {
        const historyContainer = document.getElementById('history');
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.success ? 'success' : 'error'}`;
        
        historyItem.innerHTML = `
            <div class="history-title">${item.title}</div>
            <div class="history-meta">
                ${item.timestamp} | Destino: ${item.target}
            </div>
            <div>${item.body}</div>
            <div><strong>${item.success ? 'Éxito' : 'Error'}</strong>: ${item.message}</div>
        `;
        
        // Insertar al principio del historial
        historyContainer.insertBefore(historyItem, historyContainer.firstChild);
        
        // Limitar el historial a 10 elementos
        const items = historyContainer.getElementsByClassName('history-item');
        if (items.length > 10) {
            historyContainer.removeChild(items[items.length - 1]);
        }
    }

    // Función para analizar campos JSON
    function parseJsonField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            return {};
        }
        
        try {
            return JSON.parse(field.value);
        } catch (e) {
            console.error('Error al analizar JSON:', e);
            return {};
        }
    }
});