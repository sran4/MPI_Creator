# PowerShell script to install all recommended VS Code extensions
# Run this script in PowerShell as Administrator

Write-Host "Installing VS Code Extensions for MERN/Next.js/Django Development..." -ForegroundColor Green

$extensions = @(
    # Code Formatting & Quality
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "formulahendry.auto-rename-tag",
    
    # Tailwind CSS & Styling
    "bradlc.vscode-tailwindcss",
    "pranaygp.vscode-css-peek",
    "naumovs.color-highlight",
    
    # React/Next.js Development
    "dsznajder.es7-react-js-snippets",
    "pulkitgangwar.nextjs-snippets",
    
    # Django/Python Development
    "ms-python.python",
    "batisteo.vscode-django",
    "njpwerner.autodocstring",
    
    # Database & API Development
    "rangav.vscode-thunder-client",
    "mongodb.mongodb-vscode",
    
    # Productivity & Development
    "eamodio.gitlens",
    "coenraads.bracket-pair-colorizer-2",
    "christian-kohler.path-intellisense",
    "steoates.autoimport",
    
    # UI/UX & Icons
    "pkief.material-icon-theme",
    "oderwat.indent-rainbow",
    
    # Mobile & Responsive
    "ritwickdey.liveserver",
    "peterhdd.vscode-responsive-viewer",
    
    # Additional Helpful Extensions
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml"
)

foreach ($extension in $extensions) {
    Write-Host "Installing $extension..." -ForegroundColor Yellow
    code --install-extension $extension
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully installed $extension" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install $extension" -ForegroundColor Red
    }
}

Write-Host "`nExtension installation completed!" -ForegroundColor Green
Write-Host "Please restart VS Code to ensure all extensions are properly loaded." -ForegroundColor Cyan
