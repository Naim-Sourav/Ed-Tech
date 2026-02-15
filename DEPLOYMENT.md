# GitHub Pages Deployment Guide / GitHub Pages এ ডিপ্লয়মেন্ট গাইড

## Overview / সংক্ষিপ্ত বিবরণ

This project is configured to automatically deploy to GitHub Pages whenever changes are pushed to the `main` branch.

এই প্রজেক্টটি `main` ব্রাঞ্চে পরিবর্তন পুশ করা হলে স্বয়ংক্রিয়ভাবে GitHub Pages এ ডিপ্লয় হওয়ার জন্য কনফিগার করা হয়েছে।

## Deployment URL / ডিপ্লয়মেন্ট URL

Once deployed, your website will be available at:
ডিপ্লয় হওয়ার পরে, আপনার ওয়েবসাইট এই লিংকে পাওয়া যাবে:

**https://naim-sourav.github.io/Ed-Tech/**

## How It Works / এটি কীভাবে কাজ করে

### Automatic Deployment / স্বয়ংক্রিয় ডিপ্লয়মেন্ট

1. When you push changes to the `main` branch, GitHub Actions automatically triggers
   - `main` ব্রাঞ্চে পরিবর্তন পুশ করলে GitHub Actions স্বয়ংক্রিয়ভাবে ট্রিগার হয়

2. The workflow (`.github/workflows/deploy.yml`) runs and:
   - ওয়ার্কফ্লো (`.github/workflows/deploy.yml`) চলে এবং:
   - Installs dependencies / ডিপেন্ডেন্সি ইনস্টল করে
   - Builds the project / প্রজেক্ট বিল্ড করে
   - Deploys to GitHub Pages / GitHub Pages এ ডিপ্লয় করে

3. Your website is live! / আপনার ওয়েবসাইট লাইভ!

### Manual Deployment (Optional) / ম্যানুয়াল ডিপ্লয়মেন্ট (ঐচ্ছিক)

If you want to deploy manually using the `gh-pages` package:
যদি আপনি `gh-pages` প্যাকেজ ব্যবহার করে ম্যানুয়ালি ডিপ্লয় করতে চান:

```bash
npm run build
npm run deploy
```

## Configuration Details / কনফিগারেশন বিবরণ

### 1. Vite Configuration

The `vite.config.ts` file is configured with the correct base path:
`vite.config.ts` ফাইলটি সঠিক বেস পাথ দিয়ে কনফিগার করা হয়েছে:

```typescript
base: process.env.NODE_ENV === 'production' ? '/Ed-Tech/' : '/'
```

This ensures all assets load correctly when deployed to GitHub Pages.
এটি নিশ্চিত করে যে GitHub Pages এ ডিপ্লয় করার সময় সব অ্যাসেট সঠিকভাবে লোড হয়।

### 2. GitHub Actions Workflow

The `.github/workflows/deploy.yml` file contains the deployment configuration.
`.github/workflows/deploy.yml` ফাইলে ডিপ্লয়মেন্ট কনফিগারেশন রয়েছে।

## Enabling GitHub Pages / GitHub Pages সক্রিয় করা

To enable GitHub Pages for your repository:
আপনার রিপোজিটরির জন্য GitHub Pages সক্রিয় করতে:

1. Go to your repository on GitHub
   - GitHub এ আপনার রিপোজিটরিতে যান

2. Click on **Settings** → **Pages**
   - **Settings** → **Pages** এ ক্লিক করুন

3. Under "Build and deployment", select:
   - "Build and deployment" এর অধীনে সিলেক্ট করুন:
   - **Source**: GitHub Actions
   - **Branch**: (will be automatically managed by the workflow)

4. Save the settings
   - সেটিংস সংরক্ষণ করুন

5. Push this PR to the `main` branch to trigger deployment
   - ডিপ্লয়মেন্ট ট্রিগার করতে এই PR টি `main` ব্রাঞ্চে পুশ করুন

## Environment Variables / এনভায়রনমেন্ট ভেরিয়েবল

If your app uses environment variables (like API keys), you need to add them to GitHub Secrets:
যদি আপনার অ্যাপ এনভায়রনমেন্ট ভেরিয়েবল (যেমন API keys) ব্যবহার করে, তাহলে GitHub Secrets এ যোগ করতে হবে:

1. Go to **Settings** → **Secrets and variables** → **Actions**
   - **Settings** → **Secrets and variables** → **Actions** এ যান

2. Click **New repository secret**
   - **New repository secret** এ ক্লিক করুন

3. Add `VITE_API_KEY` with your Gemini API key
   - আপনার Gemini API key দিয়ে `VITE_API_KEY` যোগ করুন

## Checking Deployment Status / ডিপ্লয়মেন্ট স্ট্যাটাস চেক করা

To check if your deployment was successful:
আপনার ডিপ্লয়মেন্ট সফল হয়েছে কিনা তা চেক করতে:

1. Go to the **Actions** tab in your repository
   - আপনার রিপোজিটরির **Actions** ট্যাবে যান

2. Look for the latest workflow run
   - সর্বশেষ ওয়ার্কফ্লো রান খুঁজুন

3. If it shows a green checkmark ✅, deployment was successful
   - যদি সবুজ চেকমার্ক ✅ দেখায়, তাহলে ডিপ্লয়মেন্ট সফল হয়েছে

4. If it shows a red X ❌, click on it to see the error logs
   - যদি লাল X ❌ দেখায়, তাহলে এরর লগ দেখতে ক্লিক করুন

## Troubleshooting / সমস্যা সমাধান

### 404 Error on Deployment / ডিপ্লয়মেন্টে 404 এরর

If you get a 404 error:
যদি 404 এরর পান:

1. Make sure GitHub Pages is enabled in Settings
   - নিশ্চিত করুন যে Settings এ GitHub Pages সক্রিয় করা আছে

2. Verify the base path in `vite.config.ts` matches your repository name
   - `vite.config.ts` এর বেস পাথ আপনার রিপোজিটরি নামের সাথে মিলছে কিনা যাচাই করুন

### Assets Not Loading / অ্যাসেট লোড হচ্ছে না

If CSS or JavaScript files are not loading:
যদি CSS বা JavaScript ফাইল লোড না হয়:

1. Check the browser console for errors
   - ব্রাউজার কনসোলে এরর চেক করুন

2. Verify the `base` path in `vite.config.ts` is correct
   - `vite.config.ts` এর `base` পাথ সঠিক কিনা যাচাই করুন

### Build Failures / বিল্ড ফেইলিয়র

If the build fails:
যদি বিল্ড ফেইল হয়:

1. Run `npm run build` locally to see the error
   - এরর দেখতে লোকালি `npm run build` রান করুন

2. Fix any TypeScript or build errors
   - যেকোনো TypeScript বা বিল্ড এরর ফিক্স করুন

3. Push the fixes to trigger a new deployment
   - নতুন ডিপ্লয়মেন্ট ট্রিগার করতে ফিক্স পুশ করুন

## Local Development / লোকাল ডেভেলপমেন্ট

To run the app locally:
লোকালি অ্যাপ চালাতে:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
অ্যাপটি `http://localhost:5173` এ পাওয়া যাবে

## Building for Production / প্রোডাকশনের জন্য বিল্ড

To build the app for production:
প্রোডাকশনের জন্য অ্যাপ বিল্ড করতে:

```bash
npm run build
```

The built files will be in the `dist/` directory.
বিল্ট ফাইলগুলো `dist/` ডিরেক্টরিতে থাকবে।

## Support / সাপোর্ট

If you encounter any issues, please:
যদি কোনো সমস্যার সম্মুখীন হন, তাহলে:

1. Check the GitHub Actions logs for deployment errors
   - ডিপ্লয়মেন্ট এরর এর জন্য GitHub Actions লগ চেক করুন

2. Ensure all environment variables are properly configured
   - সব এনভায়রনমেন্ট ভেরিয়েবল সঠিকভাবে কনফিগার করা আছে তা নিশ্চিত করুন

3. Verify that the repository has the correct permissions for GitHub Pages
   - রিপোজিটরিতে GitHub Pages এর জন্য সঠিক পারমিশন আছে তা যাচাই করুন
