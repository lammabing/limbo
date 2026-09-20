const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Game state management
    getGameState: () => ipcRenderer.invoke('get-game-state'),
    initGame: (options) => ipcRenderer.invoke('init-game', options),
    runSimulation: (options) => ipcRenderer.invoke('run-simulation', options),
    resetGame: () => ipcRenderer.invoke('reset-game'),
    
    // File operations
    saveSessionFile: (options) => ipcRenderer.invoke('save-session-file', options),
    loadSessionFile: (options) => ipcRenderer.invoke('load-session-file', options),
    
    // Platform info
    platform: process.platform,
    isElectron: true
});

// Log that the preload script has loaded
console.log('Electron preload script loaded successfully');
