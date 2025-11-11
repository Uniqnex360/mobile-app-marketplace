<< 'EOF'
#!/bin/bash
set -e

echo "Running pre-install script..."
echo "Current directory: $(pwd)"
echo "Listing android directory..."
ls -la android/ || true

# This will be run before dependencies are installed
