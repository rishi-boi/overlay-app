const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  // Get screen dimensions
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create transparent overlay window
  mainWindow = new BrowserWindow({
    width,
    height,
    // x: width - 270, // Back to top-right corner
    // y: 20,
    transparent: true, // Make transparent
    frame: false, // Remove window frame
    alwaysOnTop: true,
    skipTaskbar: true, // Hide from taskbar
    resizable: false,
    movable: true, // Allow moving
    minimizable: true, // Allow minimize for convenience
    maximizable: false,
    closable: true, // Allow closing
    focusable: true, // Allow focus for dragging
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.setContentProtection(true);
  // Add keyboard shortcut to toggle drag mode
  const { globalShortcut } = require("electron");

  app.whenReady().then(() => {
    // Ctrl + Q to quit
    globalShortcut.register("CommandOrControl+Q", () => {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      app.quit();
    });

    // Ctrl+Alt+H to on protection
    // globalShortcut.register("CommandOrControl+Alt+H", () => {
    //   mainWindow.setContentProtection(true);
    // });
  });

  // Load HTML file instead of inline data
  mainWindow.loadURL(" http://localhost:3000");

  // Show window immediately and add debugging
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
    console.log("RISHI Overlay window created and shown!");
    console.log("Window bounds:", mainWindow.getBounds());
    console.log("Window is visible:", mainWindow.isVisible());
  });

  // Add error handling
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.log("Failed to load:", errorCode, errorDescription);
    }
  );

  // Show window immediately (don't wait for ready-to-show)
  mainWindow.show();

  // Keep always on top
  mainWindow.setAlwaysOnTop(true, "screen-saver");
}

// App event handlers
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Hide from dock on macOS
if (process.platform === "darwin") {
  app.dock.hide();
}

// Auto-launch with system (optional)
// app.setLoginItemSettings({
//   openAtLogin: true,
//   openAsHidden: true
// });

console.log("Starting RISHI Overlay Desktop App...");
