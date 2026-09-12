# GitHub Pages Deployment Guide / GitHub Pages এ ডিপ্লয়মেন্ট গাইড

## Overview / সংক্ষিপ্ত বিবরণ

This project is configured to automatically deploy to GitHub Pages whenever changes are pushed to the `main` branch.

এই প্রজেক্টটি `main` ব্রাঞ্চে পরিবর্তন পুশ করা হলে স্বয়ংক্রিয়ভাবে GitHub Pages এ ডিপ্লয় হওয়ার জন্য কনফিগার করা হয়েছে।

## Deployment URL / ডিপ্লয়মেন্ট URL

Once deployed, your website will be available at:
ডিপ্লয় হওয়ার পরে, আপনার ওয়েবসাইট এই লিংকে পাওয়া যাবে:

**https://www.porikkhangon.app/** (custom domain via `public/CNAME`)

> The app uses clean URLs (BrowserRouter). Deep links work on GitHub Pages
> through the `public/404.html` → `?p=` redirect trick restored in `index.html`.
> `npm run build` also generates static SEO pages (`/hsc-syllabus/...`, `/q/...`)
> plus `sitemap.xml` into `dist/` — see `SEO-AUDIT.md`.

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
