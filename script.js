const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const model={model: 'claude-opus-4', stream: true};//claude-opus-4    claude-sonnet-4

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send message on Enter (but allow Shift+Enter for new line)
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function addMessage(content, isUser = false, isStreaming = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? 'U' : 'AI';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isStreaming) {
        messageContent.id = 'streaming-message';
    }
    
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageContent;
}

function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function streamClaudeResponse(query, model) {
    try {
        // Cek apakah puter tersedia
        if (typeof puter === 'undefined') {
            console.log("js puter tidak terpanggil");
            throw new Error('Puter AI tidak tersedia. Pastikan aplikasi berjalan di environment Puter.');
        }
        console.log("js puter ada terpanggil");
        showTypingIndicator();
        
        const response = await puter.ai.chat(query, model);
        hideTypingIndicator();

        // Cek jika response null/undefined
        if (!response) {
            throw new Error('No response received from API');
        }
        console.log(response);
        
        // Buat message container untuk streaming
        const messageElement = addMessage('', false, true);
        let fullText = '';

        // Cek apakah response error dari api puter 
        console.log("Cek apakah response error dari api puter ");
        if (!response.success) {
            console.log("API error response");
            console.log(response);
            throw new Error(response.error?.message || 'API request failed');
        }
        
        for await (const part of response) {
            if (part.text) {
                fullText += part.text;
                messageElement.textContent = fullText;
                scrollToBottom();
                
                // Optional: tambahkan delay untuk efek typing yang lebih smooth
                await new Promise(resolve => setTimeout(resolve, 20));
            }
        }
        
        console.log('Streaming complete. Full text:', fullText);
        return fullText;
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Error streaming response:', error);
        
        // Tampilkan pesan error ke user
        addMessage(
            `Maaf, terjadi kesalahan: ${error.message}. Pastikan aplikasi berjalan di environment Puter yang mendukung AI.`, 
            false
        );
        
        return null;
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Disable input sementara
    sendButton.disabled = true;
    chatInput.disabled = true;
    
    // Tampilkan pesan user
    addMessage(message, true);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Kirim ke Puter AI dan stream response
    console.log("Kirim ke Puter AI dan stream response");
    await streamClaudeResponse(message,model);
    
    // Re-enable input
    sendButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
}

// Simulasi untuk demo (jika puter tidak tersedia)
if (typeof puter === 'undefined') {
    console.warn('Puter AI tidak tersedia. Menggunakan simulasi untuk demo.');
    
    window.streamClaudeResponse = async function(query) {
        showTypingIndicator();
        
        // Simulasi delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideTypingIndicator();
        
        const simulatedResponses = [
            "Terima kasih atas pertanyaan Anda! Ini adalah respons simulasi karena Puter AI belum tersedia di environment ini.",
            "Saya memahami pertanyaan Anda tentang '" + query + "'. Dalam implementasi sebenarnya, saya akan memberikan respons yang relevan menggunakan Puter AI.",
            "Untuk menggunakan fitur AI yang sesungguhnya, pastikan kode ini berjalan di dalam environment Puter yang mendukung puter.ai.chat()."
        ];
        
        const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
        
        // Simulasi streaming
        const messageElement = addMessage('', false, true);
        let currentText = '';
        
        for (let i = 0; i < randomResponse.length; i++) {
            currentText += randomResponse[i];
            messageElement.textContent = currentText;
            scrollToBottom();
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        return randomResponse;
    };
}

// Focus input saat halaman dimuat
window.addEventListener('load', () => {
    chatInput.focus();
});