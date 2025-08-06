#!/bin/bash

# JEHUB Telegram Bot Setup Script for PythonAnywhere
echo "🤖 Starting JEHUB Telegram Bot Setup..."

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

# Create a PythonAnywhere task helper script
echo "⏰ Creating task setup helper..."
cat > setup_task.py << 'EOL'
import os
import sys

print("🤖 JEHUB Telegram Bot - PythonAnywhere Task Setup Helper")
print("\nCopy and paste the following command into your PythonAnywhere scheduled task:")
print("\n" + "-" * 80)
print(f"cd {os.getcwd()} && ./run_bot.sh")
print("-" * 80)
print("\nFor always-on task (paid accounts), use the same command.")
print("\nInstructions:")
print("1. Go to the 'Tasks' tab in PythonAnywhere")
print("2. Create a new scheduled task or always-on task")
print("3. Paste the command above")
print("4. Set the schedule (for scheduled tasks)")
print("5. Click 'Create'")
EOL

# Run a quick test to check if everything is set up correctly
echo "🧪 Running setup verification..."
python test_bot_startup.py

echo "\n✅ Setup complete! Here's what to do next:"
echo "1. Edit your .env file with 'nano .env' if you haven't already"
echo "2. Run 'python setup_task.py' to get the command for PythonAnywhere tasks"
echo "3. To start the bot manually, run './run_bot.sh'"