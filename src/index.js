const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const path = require('node:path');

// require('update-electron-app')();

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {

  mainWindow = new BrowserWindow({
    width: 850,
    height: 700,
    minWidth: 850,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, '/assets/js/preload.js'),
      contextIsolation: true,
      nodeIntegration: true
    },
  });

  mainWindow.setResizable(true);

  mainWindow.loadFile(path.join(__dirname, '/assets/html/index.html'));

  // mainWindow.setAlwaysOnTop(true);

  // mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null);
};

ipcMain.on('extra', (event, args) => {
  const show = args.show;

  if(!show) {
    // mainWindow.setResizable(false);
    mainWindow.setMinimumSize(350, 700);
    mainWindow.setMaximumSize(350, 1440);
    mainWindow.setSize(350, 700);
  }
  else {
    // mainWindow.setResizable(true);
    mainWindow.setMinimumSize(850, 700);
    mainWindow.setMaximumSize(3656, 2664);
    mainWindow.setSize(850, 700);
  }
});

ipcMain.on('setAlwaysOnTop', (event, args) => {
  mainWindow.setAlwaysOnTop(eval(args));
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});