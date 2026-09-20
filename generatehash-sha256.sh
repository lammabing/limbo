#!/bin/bash

# Generate SHA256 hash
# Usage: ./generatehash-sha256.sh [input_string]
# If no input provided, generates a random string

if [ -n "$1" ]; then
    # Hash the provided input
    echo -n "$1" | sha256sum | awk '{print $1}'
else
    # Generate a random string and hash it
    RANDOM_STRING=$(openssl rand -hex 16)
    echo "Input: $RANDOM_STRING"
    echo -n "$RANDOM_STRING" | sha256sum | awk '{print $1}'
fi
