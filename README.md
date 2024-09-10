# 🚀 SvelteKit Project Setup / aka Quickstarter

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Font Awesome](https://img.shields.io/badge/Font_Awesome-339AF0?style=for-the-badge&logo=fontawesome&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-B8DBE4?style=for-the-badge&logo=pocketbase&logoColor=black)

A lightning-fast setup for SvelteKit projects with all the essential features you need.

</div>

## 📖 Table of Contents

- [What does setup.mjs do?](#-what-does-setupmjs-do)
- [Installed Features](#-installed-features)
- [Getting Started](#-getting-started)
- [Using Svelte Inspector](#-using-svelte-inspector)
- [Additional Information](#-additional-information)

## 🛠 What does setup.mjs do?

The `setup.mjs` script is a custom setup tool for SvelteKit projects. It provides two installation options:

1. **🚀 Default Install**: Automatically installs and configures all available features.
2. **🎛 Manual Install**: Allows you to choose which features to install step-by-step.

### Tasks performed by the script:

- 🧹 Cleans up existing files and folders (except itself)
- 📦 Installs SvelteKit and configures it with adapter-node
- 🎨 Sets up Tailwind CSS and Tailwind Typography
- 🔣 Installs Font Awesome icons
- 🗄️ Configures PocketBase integration
- 📁 Creates necessary folders and files (e.g., .gitignore, demo page)
- 🌓 Updates app.html with dark mode support
- 📱 Creates a layout file with responsive navigation
- ⚠️ Creates a custom error page
- 🔄 Initializes a git repository (optional)
- 🏃‍♂️ Starts the development server (optional)

## 🚀 Installed Features

This project includes the following features:

- ✅ SvelteKit
- ✅ SvelteKit with adapter-node
- ✅ Tailwind CSS
- ✅ Tailwind Typography
- ✅ Font Awesome Icons
- ✅ PocketBase
- ✅ Svelte Inspector
- ✅ Dark mode support
- ✅ Responsive navigation
- ✅ Custom error page

## 🏁 Getting Started

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/sveltekit-quickstart.git
   cd sveltekit-quickstart
   ```

2. Set the `PB_URL` in your `.env` file to your PocketBase server URL:
   ```
   PB_URL=https://your-pocketbase-url.com
   ```

3. Run the setup script:
   ```bash
   node setup.mjs
   ```

4. Run the development server:
   ```bash
   npm run dev -- --host --open
   ```

Your default browser should open automatically and navigate to the local development server (usually `http://localhost:5173`).

## 🔍 Using Svelte Inspector

To activate the Svelte Inspector:

- On macOS: Press `Command + Shift`
- On other systems: Press `Ctrl + Shift`

The inspector toggle button will always be visible in the bottom-right corner of your app.

## 📚 Additional Information

For more details on how to use SvelteKit, Tailwind CSS, or any of the other installed features, please refer to their respective documentation:

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Font Awesome Documentation](https://fontawesome.com/docs)
- [PocketBase Documentation](https://pocketbase.io/docs/)

Happy coding! 🎉
