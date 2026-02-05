const API_BASE_URL = 'http://localhost:8000';
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');

// Initialize chat on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadChatHistory();
    messageInput.focus();
});

// Load chat history from API
async function loadChatHistory() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const history = await response.json();
        
        // Clear container (except loading indicator)
        chatContainer.innerHTML = '';
        
        if (history && history.length > 0) {
            // Render each message pair
            history.forEach((item) => {
                if (item.prompt) {
                    addMessage(item.prompt, 'user');
                }
                if (item.response) {
                    addMessage(item.response, 'ai');
                }
            });
        } else {
            // Show welcome message if no history
            addWelcomeMessage();
        }
        
        scrollToBottom();
    } catch (error) {
        console.error('Error loading chat history:', error);
        showErrorMessage('Не удалось загрузить историю чата. Проверьте подключение к серверу.');
    }
}

// Send message to API
async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) {
        return;
    }

    // Disable input and button
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Show loading indicator
    showLoadingIndicator();
    scrollToBottom();

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        // Add AI response
        if (data.answer) {
            addMessage(data.answer, 'ai');
        } else {
            throw new Error('No answer in response');
        }
        
        scrollToBottom();
    } catch (error) {
        console.error('Error sending message:', error);
        hideLoadingIndicator();
        showErrorMessage('Ошибка при отправке сообщения. Проверьте подключение к серверу и настройки CORS.');
    } finally {
        // Re-enable input and button
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Add message to chat container
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-enter flex ${type === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = `max-w-[80%] rounded-lg px-4 py-3 ${
        type === 'user' 
            ? 'bg-slate-700 text-slate-100' 
            : 'bg-slate-800 text-slate-100 border border-slate-700'
    }`;
    
    // Format message text (preserve line breaks)
    const formattedText = text.replace(/\n/g, '<br>');
    messageContent.innerHTML = formattedText;
    
    messageDiv.appendChild(messageContent);
    
    // Insert before loading indicator if it exists
    if (loadingIndicator && loadingIndicator.parentNode) {
        chatContainer.insertBefore(messageDiv, loadingIndicator);
    } else {
        chatContainer.appendChild(messageDiv);
    }
}

// Show welcome message
function addWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'text-center text-slate-400 py-8';
    welcomeDiv.textContent = 'Начните общение с AI ассистентом';
    chatContainer.appendChild(welcomeDiv);
}

// Show error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4';
    errorDiv.textContent = message;
    chatContainer.appendChild(errorDiv);
    scrollToBottom();
}

// Show loading indicator
function showLoadingIndicator() {
    loadingIndicator.classList.remove('hidden');
    chatContainer.appendChild(loadingIndicator);
}

// Hide loading indicator
function hideLoadingIndicator() {
    loadingIndicator.classList.add('hidden');
}

// Scroll to bottom of chat
function scrollToBottom() {
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize input (optional enhancement)
messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});
