// ===================================
// Data Model & Storage
// ===================================

const STORAGE_KEY = 'mm_recovery_page_v1';

const profile = {
    name: "Michael Montgomery",
    spouse: "Jean",
    timezone: "America/Los_Angeles",
    eveningWindow: { start: "17:00", end: "20:00" },
    medication: { type: "oral_naltrexone", doseTime: "14:00" }
};

const chapterData = {
    c1: {
        title: "Being Seen vs The Audience Problem",
        summary: "How to be seen without feeling graded; replace proving with sharing; safe exposure.",
        fallbackQuestions: [
            "When did anticipation of evaluation last change your behavior? What did you avoid?",
            "If you reframe 'being seen' as 'being useful,' what 10-minute action becomes possible?",
            "Name one person who feels safe to be imperfect with. How could you involve them this week?"
        ]
    },
    c2: {
        title: "The 4:55 Hand-Off (State Transition)",
        summary: "Design a 4:55 pm ritual to transition from day-self to evening-self before the 5–8 pm risk window.",
        fallbackQuestions: [
            "What signal tells your body 'workday over' today?",
            "Which 10-minute action has the highest chance of success on a bad day?",
            "How could you pair your dose time and hand-off so they reinforce each other?"
        ]
    },
    c3: {
        title: "'Getting Lost' as Amnesty",
        summary: "Design clean amnesty rituals that are visible and trust-building, not hidden.",
        fallbackQuestions: [
            "What feeling are you most eager to suspend at day's end?",
            "What's a sober amnesty you'd look forward to?",
            "How could you make it visible without seeking permission?"
        ]
    },
    c4: {
        title: "Secrecy as Competence Protection",
        summary: "Practice honesty micro-reps to weaken hiding reflexes and strengthen connection.",
        fallbackQuestions: [
            "What truth feels safe to say but you usually skip?",
            "When did secrecy increase your workload?",
            "What would a 7/10 honest day (not 10/10) look like?"
        ]
    },
    c5: {
        title: "Niche → Social (Curate, don't perform)",
        summary: "Keep your niches but add people through curation, not performance.",
        fallbackQuestions: [
            "What tiny social version of a niche would you try once?",
            "What makes hosting feel safer than performing?",
            "Where could this repeat without effort?"
        ]
    },
    c6: {
        title: "Retirement Identity Portfolio (Roles > Activities)",
        summary: "Choose micro-roles with fixed cadences to create rhythm and stability.",
        fallbackQuestions: [
            "Which role gives you energy after 60 minutes?",
            "What is one cadence you could keep through travel?",
            "How will you know the role is working?"
        ]
    },
    c7: {
        title: "Awe at Dusk (Shrink the self, shrink the urge)",
        summary: "Use awe walks at dusk to reduce self-focus and reset evening tone.",
        fallbackQuestions: [
            "When did awe last interrupt anxiety?",
            "What place nearby evokes scale or history?",
            "How does your body feel 5 minutes after awe?"
        ]
    },
    c8: {
        title: "Test-Ban (Two sleeps)",
        summary: "Impose 48-hour delays and tell a buddy when testing thoughts appear.",
        fallbackQuestions: [
            "What does the test promise that you already know it can't deliver?",
            "Who hears your test texts without drama?",
            "What will you do at hour 47?"
        ]
    },
    c9: {
        title: "Map the Evening Terrain (Avoid ambush routes)",
        summary: "Design safe routes and room routines to help your feet help your mind.",
        fallbackQuestions: [
            "What is your most dangerous 10 steps between 5–6 pm?",
            "Where can you literally not buy alcohol on your way?",
            "What object in a room tells you what to do next?"
        ]
    },
    c10: {
        title: "Frame-Keeper (Medication as a ritual)",
        summary: "Ritualize oral naltrexone as a daily oath and frame-keeper.",
        fallbackQuestions: [
            "What sentence will you mentally tie to your dose?",
            "What tells you you've kept the frame by 6 pm?",
            "How will you handle a missed dose without shame?"
        ]
    }
};

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        profile,
        resonantLines: [],
        notes: [],
        aiPrompts: [],
        theme: 'light',
        focusMode: false
    };
}

// Save data to localStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

// ===================================
// Theme Management
// ===================================

function initTheme() {
    const savedTheme = appData.theme || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    appData.theme = newTheme;
    saveData(appData);
    showToast(`Switched to ${newTheme} mode`);
}

// ===================================
// Focus Mode
// ===================================

function initFocusMode() {
    const focusMode = appData.focusMode || false;
    document.documentElement.setAttribute('data-focus-mode', focusMode);
}

function toggleFocusMode() {
    const current = document.documentElement.getAttribute('data-focus-mode') === 'true';
    const newState = !current;
    document.documentElement.setAttribute('data-focus-mode', newState);
    appData.focusMode = newState;
    saveData(appData);
    showToast(newState ? 'Focus mode enabled' : 'Focus mode disabled');
}

// ===================================
// Toast Notifications
// ===================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===================================
// Text Selection & Resonant Lines
// ===================================

let selectionRange = null;
let selectionChapterId = null;

function initTextSelection() {
    const selectableElements = document.querySelectorAll('[data-selectable="true"]');
    
    selectableElements.forEach(element => {
        element.addEventListener('mouseup', handleTextSelection);
        element.addEventListener('touchend', handleTextSelection);
    });
    
    document.addEventListener('mousedown', (e) => {
        const tooltip = document.getElementById('selection-tooltip');
        if (!tooltip.contains(e.target)) {
            hideSelectionTooltip();
        }
    });
}

function handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 10) {
        const range = selection.getRangeAt(0);
        selectionRange = range;
        
        // Find chapter ID
        const chapterElement = e.target.closest('.chapter');
        selectionChapterId = chapterElement ? chapterElement.dataset.chapterId : null;
        
        showSelectionTooltip(e);
    } else {
        hideSelectionTooltip();
    }
}

function showSelectionTooltip(e) {
    const tooltip = document.getElementById('selection-tooltip');
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        tooltip.style.top = `${rect.top + window.scrollY - 45}px`;
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 75}px`;
        tooltip.style.display = 'block';
    }
}

function hideSelectionTooltip() {
    const tooltip = document.getElementById('selection-tooltip');
    tooltip.style.display = 'none';
    selectionRange = null;
    selectionChapterId = null;
}

function saveResonantLine() {
    if (!selectionRange || !selectionChapterId) return;
    
    const selectedText = window.getSelection().toString().trim();
    
    const resonantLine = {
        id: 'r' + Date.now(),
        chapterId: selectionChapterId,
        text: selectedText,
        timestamp: new Date().toISOString()
    };
    
    appData.resonantLines.push(resonantLine);
    saveData(appData);
    
    updateResonantCount();
    showToast('Saved as resonant line');
    hideSelectionTooltip();
    window.getSelection().removeAllRanges();
}

function updateResonantCount() {
    const countElement = document.getElementById('resonant-count');
    if (countElement) {
        countElement.textContent = appData.resonantLines.length;
    }
}

function showResonantModal() {
    const modal = document.getElementById('resonant-modal');
    const listContainer = document.getElementById('resonant-lines-list');
    
    listContainer.innerHTML = '';
    
    if (appData.resonantLines.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No resonant lines saved yet. Highlight any text to save it.</div>';
    } else {
        appData.resonantLines.slice().reverse().forEach(line => {
            const chapterTitle = chapterData[line.chapterId]?.title || 'Unknown';
            const date = new Date(line.timestamp).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
            
            const lineElement = document.createElement('div');
            lineElement.className = 'resonant-line';
            lineElement.innerHTML = `
                <div class="resonant-text">${line.text}</div>
                <div class="resonant-meta">
                    <span class="resonant-chapter">${chapterTitle}</span>
                    <div class="resonant-actions">
                        <span class="resonant-date">${date}</span>
                        <button class="note-action-btn" onclick="deleteResonantLine('${line.id}')">Delete</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(lineElement);
        });
    }
    
    modal.style.display = 'flex';
}

function deleteResonantLine(id) {
    appData.resonantLines = appData.resonantLines.filter(line => line.id !== id);
    saveData(appData);
    updateResonantCount();
    showResonantModal(); // Refresh
    showToast('Resonant line deleted');
}

function closeResonantModal() {
    const modal = document.getElementById('resonant-modal');
    modal.style.display = 'none';
}

// ===================================
// Notes Management
// ===================================

function initNotes() {
    const notesToggleButtons = document.querySelectorAll('.notes-toggle');
    const saveNoteButtons = document.querySelectorAll('.save-note-button');
    const notesInputs = document.querySelectorAll('.notes-input');
    
    notesToggleButtons.forEach(button => {
        button.addEventListener('click', toggleNotesArea);
    });
    
    saveNoteButtons.forEach(button => {
        button.addEventListener('click', saveNote);
    });
    
    notesInputs.forEach(input => {
        input.addEventListener('input', updateCharCount);
    });
    
    // Load existing notes
    renderAllNotes();
}

function toggleNotesArea(e) {
    const chapterId = e.target.dataset.chapterId;
    const notesArea = document.querySelector(`.notes-area[data-chapter-id="${chapterId}"]`);
    
    if (notesArea.style.display === 'none' || !notesArea.style.display) {
        notesArea.style.display = 'block';
        e.target.textContent = 'Hide Notes';
    } else {
        notesArea.style.display = 'none';
        e.target.textContent = 'Jot 3 Sentences';
    }
}

function updateCharCount(e) {
    const input = e.target;
    const targetId = input.id;
    const charCount = document.querySelector(`.char-count[data-target="${targetId}"]`);
    
    if (charCount) {
        const count = input.value.length;
        charCount.textContent = `${count}/500`;
        
        if (count < 140) {
            charCount.style.color = 'var(--text-tertiary)';
        } else {
            charCount.style.color = 'var(--accent)';
        }
    }
}

function saveNote(e) {
    const chapterId = e.target.dataset.chapterId;
    const input = document.getElementById(`notes-${chapterId}`);
    const text = input.value.trim();
    
    if (text.length < 140) {
        showToast('Please write at least 140 characters');
        return;
    }
    
    const note = {
        id: 'n' + Date.now(),
        chapterId,
        text,
        timestamp: new Date().toISOString()
    };
    
    appData.notes.push(note);
    saveData(appData);
    
    input.value = '';
    updateCharCount({ target: input });
    
    renderNotes(chapterId);
    showToast('Note saved');
}

function renderAllNotes() {
    Object.keys(chapterData).forEach(chapterId => {
        renderNotes(chapterId);
    });
}

function renderNotes(chapterId) {
    const container = document.querySelector(`.saved-notes[data-chapter-id="${chapterId}"]`);
    if (!container) return;
    
    const chapterNotes = appData.notes
        .filter(note => note.chapterId === chapterId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    container.innerHTML = '';
    
    chapterNotes.forEach(note => {
        const date = new Date(note.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        
        const noteElement = document.createElement('div');
        noteElement.className = 'saved-note';
        noteElement.innerHTML = `
            <div class="note-text">${note.text}</div>
            <div class="note-meta">
                <span class="note-date">${date}</span>
                <div class="note-actions">
                    <button class="note-action-btn" onclick="copyNote('${note.id}')">Copy</button>
                    <button class="note-action-btn" onclick="deleteNote('${note.id}')">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(noteElement);
    });
}

function copyNote(id) {
    const note = appData.notes.find(n => n.id === id);
    if (note) {
        navigator.clipboard.writeText(note.text).then(() => {
            showToast('Note copied to clipboard');
        });
    }
}

function deleteNote(id) {
    const note = appData.notes.find(n => n.id === id);
    if (!note) return;
    
    appData.notes = appData.notes.filter(n => n.id !== id);
    saveData(appData);
    renderNotes(note.chapterId);
    showToast('Note deleted');
}

// ===================================
// AI Integration
// ===================================

async function generateAIReflection(chapterId) {
    const button = document.querySelector(`.ai-button[data-chapter-id="${chapterId}"]`);
    const promptsContainer = document.querySelector(`.ai-prompts[data-chapter-id="${chapterId}"]`);
    
    // Disable button and show loading
    button.disabled = true;
    promptsContainer.style.display = 'block';
    promptsContainer.innerHTML = '<div class="ai-loading"><div class="ai-spinner"></div><span>Generating reflection prompts...</span></div>';
    
    try {
        // Prepare context
        const chapterNotes = appData.notes
            .filter(note => note.chapterId === chapterId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
            .map(n => n.text);
        
        const recentResonances = appData.resonantLines
            .filter(line => line.chapterId === chapterId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
            .map(l => l.text);
        
        // Get current context
        const now = new Date();
        const hours = now.getHours();
        const localTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: profile.timezone 
        });
        
        const payload = {
            profile,
            chapterId,
            chapterSummary: chapterData[chapterId].summary,
            priorNotes: chapterNotes,
            recentResonances,
            userContext: {
                localTime,
                companionship: "unknown"
            }
        };
        
        // Make API call
        const response = await fetch('/ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('AI service unavailable');
        }
        
        const data = await response.json();
        
        // Save and render prompts
        const aiPrompt = {
            id: 'p' + Date.now(),
            chapterId,
            prompts: data.prompts,
            supportiveNotes: data.supportiveNotes,
            timestamp: new Date().toISOString()
        };
        
        appData.aiPrompts.push(aiPrompt);
        saveData(appData);
        
        renderAIPrompts(chapterId, data.prompts, data.supportiveNotes);
        
    } catch (error) {
        console.error('AI generation failed:', error);
        // Show fallback questions
        const fallbackQuestions = chapterData[chapterId].fallbackQuestions;
        renderAIPrompts(chapterId, fallbackQuestions, ['AI is currently unavailable. Here are some reflection questions to consider.']);
    } finally {
        button.disabled = false;
    }
}

function renderAIPrompts(chapterId, prompts, supportiveNotes = []) {
    const container = document.querySelector(`.ai-prompts[data-chapter-id="${chapterId}"]`);
    
    container.innerHTML = `
        <div class="ai-prompts-header">Reflection Prompts</div>
        ${prompts.map((prompt, index) => `
            <div class="ai-prompt-item" onclick="insertPromptIntoNotes('${chapterId}', ${index})">
                <div class="ai-prompt-text">${prompt}</div>
                <div class="ai-prompt-hint">Click to insert into notes</div>
            </div>
        `).join('')}
        ${supportiveNotes.length > 0 ? `
            <div class="ai-supportive-notes">
                ${supportiveNotes.map(note => `
                    <div class="ai-supportive-note">${note}</div>
                `).join('')}
            </div>
        ` : ''}
    `;
}

function insertPromptIntoNotes(chapterId, promptIndex) {
    const container = document.querySelector(`.ai-prompts[data-chapter-id="${chapterId}"]`);
    const promptItems = container.querySelectorAll('.ai-prompt-item');
    const promptText = promptItems[promptIndex]?.querySelector('.ai-prompt-text')?.textContent;
    
    if (!promptText) return;
    
    // Show notes area if hidden
    const notesArea = document.querySelector(`.notes-area[data-chapter-id="${chapterId}"]`);
    const notesToggle = document.querySelector(`.notes-toggle[data-chapter-id="${chapterId}"]`);
    
    if (notesArea.style.display === 'none' || !notesArea.style.display) {
        notesArea.style.display = 'block';
        notesToggle.textContent = 'Hide Notes';
    }
    
    // Insert prompt
    const input = document.getElementById(`notes-${chapterId}`);
    const currentText = input.value.trim();
    const newText = currentText ? `${currentText}\n\n${promptText}` : promptText;
    input.value = newText;
    updateCharCount({ target: input });
    
    // Scroll to input
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
    
    showToast('Prompt inserted into notes');
}

// ===================================
// Data Export
// ===================================

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-reflections-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully');
}

// ===================================
// Keyboard Navigation
// ===================================

function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        // Escape key closes modal
        if (e.key === 'Escape') {
            closeResonantModal();
        }
        
        // Ctrl/Cmd + E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
        
        // Ctrl/Cmd + D to toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl/Cmd + F to toggle focus mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            toggleFocusMode();
        }
    });
}

// ===================================
// Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme and focus mode
    initTheme();
    initFocusMode();
    
    // Initialize features
    initTextSelection();
    initNotes();
    initKeyboardNav();
    
    // Update resonant count
    updateResonantCount();
    
    // Event listeners
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('focus-mode-toggle')?.addEventListener('click', toggleFocusMode);
    document.getElementById('save-selection')?.addEventListener('click', saveResonantLine);
    document.getElementById('view-resonant')?.addEventListener('click', showResonantModal);
    document.getElementById('export-data')?.addEventListener('click', exportData);
    
    // Modal close handlers
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('resonant-modal');
    
    modalClose?.addEventListener('click', closeResonantModal);
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeResonantModal();
        }
    });
    
    // AI button handlers
    const aiButtons = document.querySelectorAll('.ai-button');
    aiButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const chapterId = e.target.dataset.chapterId;
            generateAIReflection(chapterId);
        });
    });
    
    // Smooth scroll for chapter navigation
    document.querySelectorAll('.chapter-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Make functions available globally for inline onclick handlers
window.deleteResonantLine = deleteResonantLine;
window.copyNote = copyNote;
window.deleteNote = deleteNote;
window.insertPromptIntoNotes = insertPromptIntoNotes;
