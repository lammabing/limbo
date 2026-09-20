#!/bin/bash

# Limbo Game Simulator - Setup and Build Script
# This script helps with installation and building the offline desktop app

set -e  # Exit on error

echo "🎮 Limbo Game Simulator - Setup Script"
echo "======================================"
echo ""

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
        echo "   Download from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ Node.js v16 or higher is required. Current version: $(node -v)"
        exit 1
    fi

    echo "✅ Node.js version: $(node -v)"
}

# Install dependencies
install_deps() {
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
}

# Run in development mode
run_dev() {
    echo ""
    echo "🚀 Starting application in development mode..."
    npm start
}

# Build for current platform
build() {
    echo ""
    echo "🔨 Building application..."
    npm run build
    echo ""
    echo "✅ Build complete! Check the 'dist' directory for distributables."
}

# Build for specific platform
build_platform() {
    PLATFORM=$1
    echo ""
    echo "🔨 Building for $PLATFORM..."
    npm run build:$PLATFORM
    echo ""
    echo "✅ Build complete for $PLATFORM!"
}

# Show help
show_help() {
    echo "Usage: ./setup.sh [command]"
    echo ""
    echo "Commands:"
    echo "  install     Install dependencies only"
    echo "  start       Run in development mode"
    echo "  build       Build for current platform"
    echo "  win         Build for Windows"
    echo "  mac         Build for macOS"
    echo "  linux       Build for Linux"
    echo "  all         Build for all platforms"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./setup.sh install    # Install dependencies"
    echo "  ./setup.sh start      # Run in development mode"
    echo "  ./setup.sh build      # Build for current platform"
    echo "  ./setup.sh win        # Build for Windows"
}

# Main script
check_node

case "${1:-install}" in
    install)
        install_deps
        ;;
    start)
        install_deps
        run_dev
        ;;
    build)
        install_deps
        build
        ;;
    win)
        install_deps
        build_platform win
        ;;
    mac)
        install_deps
        build_platform mac
        ;;
    linux)
        install_deps
        build_platform linux
        ;;
    all)
        install_deps
        build_platform all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"
