const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    backgroundColor: "#ff0000", // Red background for visibility
  });

  win.loadURL(
    'data:text/html,<h1 style="color:white;text-align:center;margin-top:50px;">RISHI TEST</h1>'
  );
  console.log("Test window should be visible now!");
});
