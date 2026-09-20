#!/bin/bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine wine64 wine32 libwine libwine:i386
