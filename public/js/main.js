document.addEventListener('DOMContentLoaded', () => {
    // Atualizar informações do usuário
    updateUserInfo();
    
    // Configurar interceptadores de erro
    setupErrorHandling();
    
    // Inicializar websocket
    initializeWebSocket();
});

function updateUserInfo() {
    const timeElement = document.getElementById('currentTime');
    const userElement = document.getElementById('currentUser');
    
    // Atualizar tempo a cada segundo
    setInterval(() => {
        const now = new Date();
        timeElement.textContent = now.toISOString().replace('T', ' ').substring(0, 19);
    }, 1000);
    
    // Atualizar nome do usuário
    userElement.textContent = localStorage.getItem('currentUser') || 'YohanPlaquesOliveira';
}

function setupErrorHandling() {
    window.onerror = (msg, url, line, col, error) => {
        showError({
            message: msg,
            source: url,
            line,
            column: col,
            error: error?.stack,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('currentUser')
        });
        return false;
    };

    window.addEventListener('unhandledrejection', (event) => {
        showError({
            message: 'Unhandled Promise Rejection',
            error: event.reason,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('currentUser')
        });
    });
}

function showError(errorData) {
    const template = document.getElementById('error-template');
    const alert = template.content.cloneNode(true);
    
    const message = alert.querySelector('.message');
    message.textContent = errorData.message;
    
    const alertElement = alert.querySelector('.alert');
    alertElement.dataset.error = JSON.stringify(errorData);
    
    const close = alertElement.querySelector('.close');
    close.addEventListener('click', () => {
        alertElement.remove();
    });
    
    const alerts = document.getElementById('alerts');
    alerts.appendChild(alert);
    
    // Enviar erro para o servidor
    fetch('/api/errors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorData)
    }).catch(console.error);
}

function initializeWebSocket() {
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.onopen = () => {
        console.log('WebSocket conectado');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onerror = (error) => {
        showError({
            message: 'WebSocket Error',
            error: error,
            timestamp: new Date().toISOString(),
            user: localStorage.getItem('currentUser')
        });
    };
    
    ws.onclose = () => {
        console.log('WebSocket desconectado');
        // Tentar reconectar após 5 segundos
        setTimeout(initializeWebSocket, 5000);
    };
}

function handleWebSocketMessage(data) {
    switch (data.type) {
        case 'error':
            showError(data);
            break;
        case 'update':
            updateContent(data);
            break;
        case 'notification':
            showNotification(data);
            break;
        default:
            console.warn('Tipo de mensagem desconhecido:', data.type);
    }
}

function updateContent(data) {
    const content = document.getElementById('content');
    
    // Atualizar conteúdo com base nos dados recebidos
    if (data.html) {
        content.innerHTML = data.html;
    } else {
        const template = document.getElementById(`${data.template}-template`);
        if (template) {
            const element = template.content.cloneNode(true);
            
            // Preencher template com dados
            Object.entries(data.data || {}).forEach(([key, value]) => {
                const target = element.querySelector(`[data-bind="${key}"]`);
                if (target) {
                    target.textContent = value;
                }
            });
            
            content.innerHTML = '';
            content.appendChild(element);
        }
    }
}

function showNotification(data) {
    // Verificar suporte a notificações
    if (!('Notification' in window)) {
        console.warn('Este navegador não suporta notificações desktop');
        return;
    }
    
    // Solicitar permissão se necessário
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Mostrar notificação se permitido
    if (Notification.permission === 'granted') {
        new Notification(data.title, {
            body: data.message,
            icon: data.icon || '/images/icon.png'
        });
    }
}