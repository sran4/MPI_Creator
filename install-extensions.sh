#!/bin/bash

# Bash script to install all recommended VS Code extensions
# Run this script in terminal: chmod +x install-extensions.sh && ./install-extensions.sh

echo "Installing VS Code Extensions for MERN/Next.js/Django Development..."

extensions=(
    # Code Formatting & Quality
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
    "formulahendry.auto-rename-tag"
    
    # Tailwind CSS & Styling
    "bradlc.vscode-tailwindcss"
    "pranaygp.vscode-css-peek"
    "naumovs.color-highlight"
    
    # React/Next.js Development
    "dsznajder.es7-react-js-snippets"
    "pulkitgangwar.nextjs-snippets"
    
    # Django/Python Development
    "ms-python.python"
    "batisteo.vscode-django"
    "njpwerner.autodocstring"
    
    # Database & API Development
    "rangav.vscode-thunder-client"
    "mongodb.mongodb-vscode"
    
    # Productivity & Development
    "eamodio.gitlens"
    "coenraads.bracket-pair-colorizer-2"
    "christian-kohler.path-intellisense"
    "steoates.autoimport"
    
    # UI/UX & Icons
    "pkief.material-icon-theme"
    "oderwat.indent-rainbow"
    
    # Mobile & Responsive
    "ritwickdey.liveserver"
    "peterhdd.vscode-responsive-viewer"
    
    # Additional Helpful Extensions
    "ms-vscode.vscode-typescript-next"
    "ms-vscode.vscode-json"
    "redhat.vscode-yaml"
)

for extension in "${extensions[@]}"; do
    echo "Installing $extension..."
    code --install-extension "$extension"
    if [ $? -eq 0 ]; then
        echo "✓ Successfully installed $extension"
    else
        echo "✗ Failed to install $extension"
    fi
done

echo ""
echo "Extension installation completed!"
echo "Please restart VS Code to ensure all extensions are properly loaded."
