# 🚀 How to Run RUNES Analytics Pro

This document provides detailed instructions for starting RUNES Analytics Pro on different operating systems.

## 📋 Prerequisites

- **Node.js**: Version 16.x or higher
- **npm**: Installed with Node.js
- **Modern browser**: Recent Chrome, Firefox, Edge, or Safari

## 🖥️ Starting on Windows

### Method 1: Using the Launcher (Recommended)

1. Double-click on the `windows-launcher.bat` file
2. The launcher will automatically detect if PowerShell is available and choose the best script

### Method 2: Using PowerShell directly

1. Right-click on the project folder and select "Open in PowerShell"
2. Run the command:
   ```powershell
   .\start-project.ps1
   ```

### Method 3: Using CMD

1. Open Command Prompt (CMD)
2. Navigate to the project folder
3. Run:
   ```cmd
   start-project.bat
   ```

## 🐧 Starting on Linux

1. Open the terminal
2. Navigate to the project folder
3. Make the script executable (if necessary):
   ```bash
   chmod +x start-project.sh
   ```
4. Run the script:
   ```bash
   ./start-project.sh
   ```

## 🍎 Starting on macOS

1. Open Terminal
2. Navigate to the project folder
3. Make the script executable (if necessary):
   ```bash
   chmod +x start-project.sh
   ```
4. Run the script:
   ```bash
   ./start-project.sh
   ```

## 📡 Accessing the Application

After starting the project, the application will be available at the following addresses:

- **Dashboard**: [http://localhost:8090](http://localhost:8090)
- **API**: [http://localhost:3000/api](http://localhost:3000/api)

## 🛑 Stopping the Application

- **On Windows (PowerShell)**: Press `CTRL+C` in the PowerShell window
- **On Windows (CMD)**: Press any key in the CMD window
- **On Linux/macOS**: Press `CTRL+C` in the terminal

## ⚙️ Advanced Startup Options

### Start only the API server

```bash
npm start
```

### Start only the documentation

```bash
npm run docs
```

### Generate only the updated README

```bash
npm run update:readme
```

### Run translation check

```bash
npm run check:translations
```

## 🔍 Troubleshooting

### Port in use

If you receive an error indicating that the port is in use:

1. Terminate any process using ports 3000 or 8090
2. Or modify the ports in the startup scripts

### Modules not found

If you receive errors about modules not found:

```bash
npm install
```

### Live-server not found

If live-server is not available:

```bash
npm install -g live-server
```

## 🆘 Support

For additional help, contact:

- GitHub: [github.com/thasv012/runes-analytics-pro](https://github.com/thasv012/runes-analytics-pro)
- Email: support@runesanalytics.pro 