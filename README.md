<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1FFcR0UQeR0rqjokuEGyJEYtO0e-WlPWf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Troubleshooting

### Windows PowerShell: Script Execution Error

If you encounter this error on Windows PowerShell:

```
npm : No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema.
```

**Solution:**

1. Open PowerShell as Administrator (right-click PowerShell and select "Run as Administrator")
2. Run the following command to allow script execution:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirm by typing `Y` when prompted
4. Close and reopen PowerShell (as a regular user)
5. Try running `npm install` again

**What this does:** This command changes the execution policy to allow locally-created scripts to run while still requiring downloaded scripts to be signed by a trusted publisher.

**Alternative solution:** If you prefer not to change the execution policy, you can use Command Prompt (cmd.exe) instead of PowerShell to run npm commands.
