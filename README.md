# Svelte-Quickstarter
Automated SvelteKit project setup with Tailwind CSS, Font Awesome, PocketBase integration, and more. Includes a custom setup script for easy installation and configuration of essential features for modern web development.


# SvelteKit Project Setup

## Part 1: What does setup.mjs do?

The `setup.mjs` script is a custom setup tool for SvelteKit projects. It provides the following options:

1. **Default Install**: Automatically installs and configures all available features.
2. **Manual Install**: Allows you to choose which features to install step-by-step.

The script performs the following tasks:

- Cleans up existing files and folders (except itself)
- Installs SvelteKit and configures it with adapter-node
- Sets up Tailwind CSS and Tailwind Typography
- Installs Font Awesome icons
- Configures PocketBase integration
- Creates necessary folders and files (e.g., .gitignore, demo page)
- Updates app.html with dark mode support
- Creates a layout file with responsive navigation
- Creates a custom error page
- Initializes a git repository (optional)
- Starts the development server (optional)

## Part 2: Installed Features

This project includes the following features:

- SvelteKit
- SvelteKit with adapter-node
- Tailwind CSS
- Tailwind Typography
- Font Awesome Icons
- PocketBase
- Svelte Inspector
- Dark mode support
- Responsive navigation
- Custom error page

## Getting Started

Set the `PB_URL` in your `.env` file to your PocketBase server URL.


Run `npm run dev -- --host --open` to start the development server.



## Using Svelte Inspector

- On macOS: Press Command + Shift
- On other systems: Press Ctrl + Shift

The inspector toggle button will always be visible in the bottom-right corner of your app.


## Additional Information

For more details on how to use SvelteKit, Tailwind CSS, or any of the other installed features, please refer to their respective documentation.

Happy coding!

