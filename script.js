// =============================================================================
// PUTER AI CHAT INTERFACE - JAVASCRIPT
// =============================================================================

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const model={model: 'claude-sonnet-4', stream: true};
// =============================================================================
// MARKDOWN CONFIGURATION
// =============================================================================

// Configure marked for better rendering
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
        // Simple syntax highlighting for common languages
        if (lang === 'javascript' || lang === 'js') {
            return code.replace(/\b(function|const|let|var|return|if|else|for|while)\b/g, '<span style="color: #d73a49;">$1</span>');
        }
        if (lang === 'python') {
            return code.replace(/\b(def|return|if|else|for|while|import|from)\b/g, '<span style="color: #d73a49;">$1</span>');
        }
        return code;
    }
});

// =============================================================================
// EVENT LISTENERS
// =============================================================================

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

// =============================================================================
// MESSAGE FUNCTIONS
// =============================================================================

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
    
    // Parse markdown for AI messages, plain text for user messages
    if (isUser) {
        messageContent.textContent = content;
    } else {
        // Parse markdown and render as HTML
        messageContent.innerHTML = marked.parse(content);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    return messageContent;
}

function updateStreamingMessage(content) {
    const streamingElement = document.getElementById('streaming-message');
    if (streamingElement) {
        // Update with parsed markdown
        streamingElement.innerHTML = marked.parse(content);
        scrollToBottom();
    }
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

// =============================================================================
// PUTER AI INTEGRATION
// =============================================================================

async function streamClaudeResponse(query, model) {
    try {
        // Cek apakah puter tersedia
        if (typeof puter === 'undefined') {
            throw new Error('Puter AI tidak tersedia. Pastikan aplikasi berjalan di environment Puter.');
        }

        showTypingIndicator();
        
        const response = await puter.ai.chat(query, model);
        
        hideTypingIndicator();
        
        // Buat message container untuk streaming
        const messageElement = addMessage('', false, true);
        let fullText = '';
        
        // Jika response adalah string langsung
        if (typeof response === 'string') {
            fullText = response;
            updateStreamingMessage(fullText);
            return fullText;
        }
        
        // Jika response memiliki method toString
        if (response && typeof response.toString === 'function') {
            fullText = response.toString();
            updateStreamingMessage(fullText);
            return fullText;
        }
        
        // Jika response adalah async iterator
        if (response && typeof response[Symbol.asyncIterator] === 'function') {
            for await (const part of response) {
                if (part.text) {
                    fullText += part.text;
                    updateStreamingMessage(fullText);
                    scrollToBottom();
                    
                    // Optional: tambahkan delay untuk efek typing yang lebih smooth
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
            }
        } else {
            // Fallback: coba akses properti content
            fullText = response?.message?.content || response?.content || 'No response';
            updateStreamingMessage(fullText);
        }
        
        console.log('Streaming complete. Full text:', fullText);
        return fullText;
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Error streaming response:', error);
        
        // Tampilkan pesan error ke user dengan markdown
        addMessage(
            `**Error**: ${error.message}\n\nPastikan aplikasi berjalan di environment Puter yang mendukung AI.`, 
            false
        );
        
        return null;
    }
}

// =============================================================================
// MAIN SEND MESSAGE FUNCTION
// =============================================================================

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
    await streamClaudeResponse(message,model);
    
    // Re-enable input
    sendButton.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
}

// =============================================================================
// SIMULASI UNTUK DEMO (JIKA PUTER TIDAK TERSEDIA)
// =============================================================================

if (typeof puter === 'undefined') {
    console.warn('Puter AI tidak tersedia. Menggunakan simulasi untuk demo.');
    
    window.streamClaudeResponse = async function(query) {
        showTypingIndicator();
        
        // Simulasi delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        hideTypingIndicator();
        
        const simulatedResponses = [
            "# Respons Simulasi\n\nTerima kasih atas pertanyaan Anda tentang **" + query + "**!\n\nIni adalah respons simulasi karena Puter AI belum tersedia di environment ini.\n\n## Fitur yang Didukung:\n- Markdown formatting\n- `Code blocks`\n- **Bold text**\n- *Italic text*\n\n### Catatan:\nUntuk menggunakan fitur AI yang sesungguhnya, pastikan kode ini berjalan di dalam environment Puter yang mendukung `puter.ai.chat()`.",
            
            "## Analisis Pertanyaan\n\nSaya memahami pertanyaan Anda tentang *" + query + "*.\n\n```javascript\n// Contoh kode JavaScript\nfunction processQuery(query) {\n    return `Processing: ${query}`;\n}\n```\n\nDalam implementasi sebenarnya, saya akan memberikan respons yang relevan menggunakan Puter AI.\n\n> **Info**: Ini adalah mode simulasi untuk demonstrasi interface.",
            
            "### Respons Markdown\n\nBerikut adalah contoh respons dengan berbagai elemen markdown:\n\n1. **Item pertama** dengan *penekanan*\n2. Item kedua dengan `inline code`\n3. Item ketiga dengan [link](https://puter.com)\n\n| Kolom 1 | Kolom 2 |\n|---------|----------|\n| Data A  | Data B   |\n| Data C  | Data D   |\n\n---\n\n**Catatan**: Untuk menggunakan AI yang sesungguhnya, jalankan di environment Puter."
        ];
        
        const randomResponse = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
        
        // Simulasi streaming
        const messageElement = addMessage('', false, true);
        let currentText = '';
        
        // Split by words for more realistic streaming
        const words = randomResponse.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            updateStreamingMessage(currentText);
            scrollToBottom();
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        return randomResponse;
    };
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Focus input saat halaman dimuat
window.addEventListener('load', () => {
    chatInput.focus();
    
    // Check if Puter is available
    if (typeof puter !== 'undefined') {
        console.log('✅ Puter AI tersedia');
    } else {
        console.log('⚠️ Puter AI tidak tersedia - menggunakan mode simulasi');
        
        // Add demo message
        setTimeout(() => {
            addMessage(
                "**Mode Demo**: Puter AI tidak terdeteksi. Interface ini akan menggunakan respons simulasi.\n\n" +
                "Untuk menggunakan AI yang sesungguhnya:\n" +
                "1. Jalankan di environment Puter\n" +
                "2. Atau load script Puter sebelum script ini", 
                false
            );
        }, 1000);
    }
});

// =============================================================================
// ADDITIONAL UTILITIES
// =============================================================================

// Function to clear chat
function clearChat() {
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h3>👋 Chat telah dibersihkan!</h3>
            <p>Silakan mulai percakapan baru.</p>
        </div>
    `;
}

// Function to export chat history
function exportChat() {
    const messages = [];
    const messageElements = chatMessages.querySelectorAll('.message');
    
    messageElements.forEach(msg => {
        const isUser = msg.classList.contains('user');
        const content = msg.querySelector('.message-content').textContent;
        messages.push({
            role: isUser ? 'user' : 'assistant',
            content: content
        });
    });
    
    return JSON.stringify(messages, null, 2);
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        clearChat();
    }
    
    // Ctrl/Cmd + E to export chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const chatData = exportChat();
        console.log('Chat Export:', chatData);
        
        // Copy to clipboard if available
        if (navigator.clipboard) {
            navigator.clipboard.writeText(chatData);
            console.log('Chat history copied to clipboard');
        }
    }
});

// Make functions available globally for debugging
window.chatUtils = {
    clearChat,
    exportChat,
    addMessage,
    updateStreamingMessage
};