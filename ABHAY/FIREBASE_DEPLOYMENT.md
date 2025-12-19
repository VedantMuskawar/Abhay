# Firebase Hosting Deployment Guide

## Step 1: Install Firebase CLI

If you haven't installed Firebase CLI globally, run:

```bash
npm install -g firebase-tools
```

Or use npx (no global installation needed):
```bash
npx firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 3: Initialize Firebase in Your Project

Navigate to your project directory and run:

```bash
firebase init hosting
```

**During initialization, you'll be asked:**

1. **Select Firebase features**: Choose `Hosting`
2. **Select a default Firebase project**: 
   - Choose an existing project, OR
   - Create a new project
3. **What do you want to use as your public directory?**: Enter `build`
4. **Configure as a single-page app?**: Answer `Yes` (important for React Router!)
5. **Set up automatic builds and deploys with GitHub?**: Answer `No` (or Yes if you want CI/CD)
6. **File build/index.html already exists. Overwrite?**: Answer `No`

## Step 4: Update Firebase Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID.

## Step 5: Build Your React App

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Step 6: Deploy to Firebase

```bash
firebase deploy --only hosting
```

## Step 7: Access Your Live Site

After deployment, Firebase will provide you with a URL like:
```
https://your-project-id.web.app
```
or
```
https://your-project-id.firebaseapp.com
```

## Additional Commands

### Preview locally before deploying:
```bash
firebase serve
```

### Deploy only hosting (faster):
```bash
firebase deploy --only hosting
```

### View deployment history:
```bash
firebase hosting:channel:list
```

## Troubleshooting

### If you get "build folder not found":
- Make sure you ran `npm run build` first
- Check that the `public` directory in `firebase.json` matches your build output folder

### If routing doesn't work:
- Make sure `rewrites` in `firebase.json` includes the catch-all route to `/index.html`
- This is already configured in the provided `firebase.json`

### If you need to update your site:
1. Make changes to your code
2. Run `npm run build` again
3. Run `firebase deploy --only hosting`

## Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify your domain
4. Update your DNS records as instructed

