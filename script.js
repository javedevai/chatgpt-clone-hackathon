// DOM Elements
const chatContainer = document.getElementById('chat-container');
const messagesList = document.getElementById('messages-list');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const historyContainer = document.getElementById('history-container');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const apiKeyInput = document.getElementById('api-key-input');
const modelIdInput = document.getElementById('model-id-input'); // Added
const systemPromptInput = document.getElementById('system-prompt-input');
const themeBtn = document.getElementById('theme-btn');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// State
let state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    systemPrompt: localStorage.getItem('system_prompt') || 'You are a helpful AI assistant.',
    modelId: localStorage.getItem('gemini_model_id') || 'gemini-1.5-flash', // Added
    history: JSON.parse(localStorage.getItem('chat_history')) || [],
    currentChatId: null,
    isGenerating: false,
    theme: localStorage.getItem('theme') || 'dark'
};

// --- Initialization ---

function init() {
    // Apply theme
    applyTheme(state.theme);
    
    // Load history
    renderHistory();

    // Setup Event Listeners
    setupEventListeners();

    // Check if new user
    if (!state.currentChatId) {
        startNewChat();
    }
}

// --- Theme Handling ---

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        themeBtn.innerHTML = '<i class="ph ph-sun text-lg"></i><span>Light Mode</span>';
    } else {
        document.documentElement.classList.remove('dark');
        themeBtn.innerHTML = '<i class="ph ph-moon text-lg"></i><span>Dark Mode</span>';
    }
    state.theme = theme;
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// --- Chat Logic ---

function startNewChat() {
    state.currentChatId = Date.now().toString();
    messagesList.innerHTML = '';
    welcomeScreen.classList.remove('hidden');
}

function loadChat(chatId) {
    const chat = state.history.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChatId = chatId;
    messagesList.innerHTML = '';
    welcomeScreen.classList.add('hidden');

    chat.messages.forEach(msg => {
        renderMessage(msg.role, msg.content, false);
    });
    
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || state.isGenerating) return;

    // UI Updates
    messageInput.value = '';
    adjustTextareaHeight();
    sendBtn.disabled = true;
    welcomeScreen.classList.add('hidden');
    messagesList.classList.remove('hidden');

    // Render User Message
    renderMessage('user', text);

    // Save to History
    saveMessageToHistory('user', text);

    // AI Logic
    state.isGenerating = true;
    showTypingIndicator();

    try {
        const responseText = await fetchAIResponse(text);
        removeTypingIndicator();
        renderMessage('assistant', responseText);
        saveMessageToHistory('assistant', responseText);
    } catch (error) {
        removeTypingIndicator();
        renderMessage('system', `Error: ${error.message}`);
    }

    state.isGenerating = false;
    sendBtn.disabled = true;
}

function saveMessageToHistory(role, content) {
    let chat = state.history.find(c => c.id === state.currentChatId);
    
    if (!chat) {
        chat = {
            id: state.currentChatId,
            title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
            timestamp: Date.now(),
            messages: []
        };
        state.history.unshift(chat);
    } else {
        state.history = state.history.filter(c => c.id !== state.currentChatId);
        state.history.unshift(chat);
    }

    chat.messages.push({ role, content, timestamp: Date.now() });
    
    localStorage.setItem('chat_history', JSON.stringify(state.history));
    renderHistory();
}

// --- API Integration (Google Gemini with Fallback) ---

function convertToGeminiFormat(messages) {
    const systemMsg = messages.find(m => m.role === 'system');
    let chatMsgs = messages.filter(m => m.role !== 'system');

    // Sanitize: Merge consecutive user messages to avoid API errors
    const sanitizedMessages = [];
    let lastRole = null;

    for (const msg of chatMsgs) {
        const role = msg.role === 'assistant' ? 'model' : 'user';

        if (role === lastRole && role === 'user') {
            // Merge with previous user message
            const lastMsg = sanitizedMessages[sanitizedMessages.length - 1];
            lastMsg.parts[0].text += `\n\n${msg.content}`;
        } else {
            // Add as new message
            sanitizedMessages.push({
                role: role,
                parts: [{ text: msg.content }]
            });
            lastRole = role;
        }
    }
    
    // Ensure the conversation starts with a user message (Gemini requires user turn first)
    if (sanitizedMessages.length > 0 && sanitizedMessages[0].role === 'model') {
        sanitizedMessages.shift(); // Remove the first model message if it exists without a preceding user message
    }

    // Ensure strict alternating turns (User -> Model -> User ...)
    // The previous loop handles User -> User merging.
    // If Model -> Model occurs (unlikely in this app but possible), we should handle it too.
     const finalMessages = [];
     lastRole = null;
     for(const msg of sanitizedMessages) {
        if(msg.role === lastRole && msg.role === 'model') {
             // Merge consecutive model messages
             const lastMsg = finalMessages[finalMessages.length - 1];
             lastMsg.parts[0].text += `\n\n${msg.parts[0].text}`;
        } else {
            finalMessages.push(msg);
            lastRole = msg.role;
        }
     }
    

    return { contents: finalMessages, systemPrompt: systemMsg?.content || '' };
}

async function fetchAIResponse(userMessage) {
    const chat = state.history.find(c => c.id === state.currentChatId);
    const messages = chat ? chat.messages.map(m => ({ role: m.role, content: m.content })) : [];
    
    const apiMessages = [
        ...messages
    ];

    const currentKey = state.apiKey ? state.apiKey.trim() : '';

    // Priority 1: Use Manual Key (if provided - useful for Live Server)
    if (currentKey) {
        console.log("Using manual key for direct API call...");
        return fetchDirectGemini(apiMessages, currentKey);
    }

    // Priority 2: Use Serverless Proxy
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: apiMessages,
                systemPrompt: state.systemPrompt
            })
        });

        if (response.status === 404 || response.status === 405) {
            throw new Error("Proxy not found. Local development with 'Live Server' requires a manual API key in Settings.");
        }

        if (!response.ok) {
            let errorMsg = 'Proxy Error';
            try {
                const err = await response.json();
                errorMsg = err.error || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

async function fetchDirectGemini(messages, apiKey) {
    const { contents, systemPrompt } = convertToGeminiFormat(messages);
    
    const geminiBody = {
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
        }
    };

    const sysInstruction = systemPrompt || state.systemPrompt;
    if (sysInstruction) {
        geminiBody.systemInstruction = {
            parts: [{ text: sysInstruction }]
        };
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${state.modelId}:generateContent?key=${apiKey}`, // Use state.modelId
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geminiBody)
            }
        );

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Gemini API Error');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            throw new Error('No response generated by Gemini.');
        }

        return text;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

// --- UI Rendering ---

function renderMessage(role, content, animate = true) {
    const isUser = role === 'user';
    const isSystem = role === 'system';
    
    const div = document.createElement('div');
    div.className = `w-full text-gray-100 border-b border-black/10 dark:border-gray-900/50 ${isUser ? 'bg-gray-800' : 'bg-[#444654]'}`;
    
    if (isSystem) {
        div.className = `w-full text-red-400 border-b border-black/10 dark:border-gray-900/50 bg-[#444654]`;
    }

    const avatar = isUser 
        ? `<div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center bg-gray-600"><i class="ph ph-user text-xl"></i></div>`
        : `<div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center bg-green-500"><i class="ph ph-robot text-xl"></i></div>`;

    const parsedContent = isSystem ? content : marked.parse(content);

    div.innerHTML = `
        <div class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto">
            <div class="flex-shrink-0 flex flex-col relative items-end">
                <div class="w-[30px] flex flex-col relative items-end">
                    ${avatar}
                </div>
            </div>
            <div class="relative flex-1 overflow-hidden markdown-content">
                ${parsedContent}
            </div>
        </div>
    `;

    messagesList.appendChild(div);
    
    div.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    scrollToBottom();
}

function showTypingIndicator() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = `w-full text-gray-100 border-b border-black/10 dark:border-gray-900/50 bg-[#444654]`;
    div.innerHTML = `
        <div class="flex p-4 gap-4 text-base md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl md:py-6 lg:px-0 m-auto">
            <div class="flex-shrink-0 flex flex-col relative items-end">
                <div class="w-[30px] flex flex-col relative items-end">
                    <div class="relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center bg-green-500"><i class="ph ph-robot text-xl"></i></div>
                </div>
            </div>
            <div class="relative flex-1 overflow-hidden flex items-center gap-1 h-6">
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            </div>
        </div>
    `;
    messagesList.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function renderHistory() {
    historyContainer.innerHTML = '<div class="text-xs font-medium text-gray-500 py-3 px-2">Recent</div>';
    
    state.history.forEach(chat => {
        const btn = document.createElement('button');
        btn.className = `flex items-center gap-3 w-full px-3 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm text-gray-100 text-left group ${state.currentChatId === chat.id ? 'bg-gray-800' : ''}`;
        btn.innerHTML = `
            <i class="ph ph-chat-teardrop text-lg text-gray-400"></i>
            <div class="flex-1 overflow-hidden whitespace-nowrap text-ellipsis relative text-gray-300 group-hover:text-white">
                ${chat.title}
                <div class="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900 to-transparent group-hover:from-gray-800"></div>
            </div>
        `;
        btn.onclick = () => loadChat(chat.id);
        historyContainer.appendChild(btn);
    });
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function adjustTextareaHeight() {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
    if(messageInput.value === '') messageInput.style.height = '24px';
}

function openSettings() {
    apiKeyInput.value = state.apiKey;
    systemPromptInput.value = state.systemPrompt;
    modelIdInput.value = state.modelId; // Added
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

function saveSettings() {
    const newKey = apiKeyInput.value.trim();
    state.apiKey = newKey;
    localStorage.setItem('gemini_api_key', newKey);
    
    const newPrompt = systemPromptInput.value.trim();
    if (newPrompt) {
        state.systemPrompt = newPrompt;
        localStorage.setItem('system_prompt', newPrompt);
    }

    const newModelId = modelIdInput.value.trim(); // Added
    if (newModelId) {
        state.modelId = newModelId;
        localStorage.setItem('gemini_model_id', newModelId);
    }

    closeSettings();
    alert('Settings Saved!');
}

function clearHistory() {
    if(confirm('Are you sure you want to clear all conversations?')) {
        state.history = [];
        localStorage.removeItem('chat_history');
        renderHistory();
        startNewChat();
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
}

function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
}

// --- Event Listeners ---

function setupEventListeners() {
    messageInput.addEventListener('input', () => {
        adjustTextareaHeight();
        sendBtn.disabled = messageInput.value.trim() === '';
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    newChatBtn.addEventListener('click', () => {
        startNewChat();
        if (window.innerWidth < 768) closeSidebar();
    });

    clearChatBtn.addEventListener('click', clearHistory);
    
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    themeBtn.addEventListener('click', toggleTheme);
    
    mobileMenuBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('#welcome-screen button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const h3 = btn.querySelector('h3').innerText;
            const p = btn.querySelector('p').innerText;
            messageInput.value = `${h3} ${p}`;
            sendMessage();
        });
    });
}

// Start App
init();
