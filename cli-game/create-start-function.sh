#!/bin/bash
# create-start-function.sh  ← RECOMMENDED VERSION

echo "Setting up 'start' command (with full argument support)..."

CONFIG_FILE=""
if [[ "$SHELL" == *"zsh"* ]]; then
    CONFIG_FILE="$HOME/.zshrc"
else
    [[ -f "$HOME/.bashrc" ]] && CONFIG_FILE="$HOME/.bashrc" || CONFIG_FILE="$HOME/.bash_profile"
fi

# Remove old start definitions
sed -i.bak '/# === START COMMAND BEGIN ===/,/# === START COMMAND END ===/d' "$CONFIG_FILE" 2>/dev/null || true

# Add new function
cat << 'EOF' >> "$CONFIG_FILE"

# === START COMMAND BEGIN ===
# Usage: start [args...]
# Runs: node init.js [args...]
# Works from any directory, always executes init.js in the current folder
start() {
    node init.js "$@"
}
# === START COMMAND END ===
EOF

echo "start command installed successfully in $CONFIG_FILE"
echo ""
echo "Reload your shell:"
echo "   source $CONFIG_FILE"
echo ""
echo "Examples:"
echo "   start"
echo "   start dev"
echo "   start build --prod"
echo "   start --help"
