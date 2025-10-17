// Expose API base URL for Electron renderer
const { contextBridge } = require('electron');

const injected = {
  API_BASE_URL: 'https://prod-marketplace.duckdns.org/omnisight/'
};

contextBridge.exposeInMainWorld('__API_BASE_URL__', injected.API_BASE_URL);
