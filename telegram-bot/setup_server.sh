#!/bin/bash

# JEHUB Telegram Bot Setup Script for Linux/Unix Servers
echo "🤖 Starting JEHUB Telegram Bot Server Setup..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file..."
    cp .env.example .env
    echo "⚠️ Please edit the .env file with your actual credentials!"
    echo "   You can use 'nano .env' to edit the file."
fi

# Create a runner script
echo "📜 Creating bot runner script..."
cat > run_bot.sh << 'EOL'
#!/bin/bash
source venv/bin/activate
python bot.py
EOL

# Make runner script executable
chmod +x run_bot.sh

# Create a systemd service file for auto-start
echo "🔄 Creating systemd service file..."
cat > jehub_telegram_bot.service << 'EOL'
[Unit]
Description=JEHUB Telegram Bot Service
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/run_bot.sh
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=jehub_telegram_bot

[Install]
WantedBy=multi-user.target
EOL

echo "📋 Creating installation instructions..."
cat > SERVER_SETUP_INSTRUCTIONS.md << 'EOL'
# JEHUB Telegram Bot Server Installation

## Complete Setup

1. Edit your .env file with your credentials: