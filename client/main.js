const electron = require('electron')
require('electron-reload')(__dirname);
const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    icon: 'img/snake-icon.png',
    title: 'SNAKE'
  })
  mainWindow.loadFile('index.html')
}

app.on('ready', createWindow)