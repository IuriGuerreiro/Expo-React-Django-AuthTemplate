# Vite Environment Variables Test

## 🔍 Debug Steps

### Step 1: Check if Vite is reading .env files

1. **Stop your Vite dev server** (Ctrl+C in terminal)

2. **Verify .env file location**:
   ```
   todoist-react/.env
   todoist-react/.env.local
   ```

3. **Check .env file content** (should have no spaces around =):
   ```env
   VITE_GOOGLE_CLIENT_ID=967357540989-brh4nqa9525kp6o63fj731k30n2is0dl.apps.googleusercontent.com
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

4. **Clear Vite cache and restart**:
   ```bash
   cd todoist-react
   rm -rf node_modules/.vite
   npm run dev
   ```

### Step 2: Check browser console

1. Open browser (http://localhost:5173)
2. Open Dev Tools (F12)
3. Go to Console tab
4. Look for "=== GOOGLE OAUTH DEBUG ===" logs
5. Check the environment variables object

### Step 3: Expected Output

✅ **Working**:
```
=== GOOGLE OAUTH DEBUG ===
All environment variables: {MODE: "development", VITE_GOOGLE_CLIENT_ID: "967357...", ...}
Google Client ID: 967357540989-brh4nqa9525kp6o63fj731k30n2is0dl.apps.googleusercontent.com
Client ID type: string
Client ID length: 72
Is clientId truthy? true
```

❌ **Not Working**:
```
=== GOOGLE OAUTH DEBUG ===
All environment variables: {MODE: "development"}
Google Client ID: undefined
Client ID type: undefined
```

### Step 4: Common Fixes

#### Fix 1: Restart Vite Server
```bash
# Kill server with Ctrl+C, then:
npm run dev
```

#### Fix 2: Check .env File Format
```env
# ✅ Correct (no spaces around =)
VITE_GOOGLE_CLIENT_ID=your-client-id

# ❌ Wrong (spaces around =)  
VITE_GOOGLE_CLIENT_ID = your-client-id
```

#### Fix 3: Clear Cache
```bash
rm -rf node_modules/.vite
npm run dev
```

#### Fix 4: Check File Encoding
- Make sure .env file is saved as UTF-8
- No BOM (Byte Order Mark)
- Use LF line endings (not CRLF)

### Step 5: Alternative Test

Create a simple test in your component:
```tsx
console.log('ENV TEST:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
  GOOGLE_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  ALL_ENV: import.meta.env
});
```

## 🚨 If Still Not Working

1. **Try .env.local instead of .env**
2. **Check if .env is in .gitignore** (might be getting ignored by your editor)
3. **Manually set the variable**:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your-id npm run dev
   ```
4. **Check Vite config** for any custom env handling

## 📝 Current Status

The debug component should show you exactly what environment variables Vite is loading. Once you see the client ID in the console logs, the Google button should appear automatically.