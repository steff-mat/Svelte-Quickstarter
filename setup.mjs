import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let logStream;

function setupLogging() {
  const logFile = 'setup_install_result.log';
  logStream = fs.createWriteStream(logFile, { flags: 'a' });
  console.log = function () {
    const message = Array.from(arguments).join(' ');
    process.stdout.write(message + '\n');
    logStream.write(message + '\n');
  };
  console.error = function () {
    const message = Array.from(arguments).join(' ');
    process.stderr.write('\x1b[31m' + message + '\x1b[0m\n');
    logStream.write('ERROR: ' + message + '\n');
  };
}

function closeLogging() {
  if (logStream) {
    logStream.end();
  }
}

function runCommand(command) {
  try {
    execSync(command, { stdio: 'inherit', shell: true });
  } catch (error) {
    console.error(`❌ Failed to execute command: ${command}`);
    process.exit(1);
  }
}

function updateFile(filePath, updateFunction) {
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = updateFunction(content);
  fs.writeFileSync(filePath, updatedContent);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
}

function cleanupFiles() {
  console.log('🧹 Cleaning up existing files and folders...');
  const currentDir = process.cwd();
  fs.readdirSync(currentDir).forEach((file) => {
    if (file !== 'setup.mjs') {
      const filePath = path.join(currentDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(`  Removed: ${file}`);
    }
  });
}

async function setupProcess() {
  setupLogging();
  console.log('🚀 Starting SvelteKit project setup...');

  try {
    cleanupFiles();

    const setupType = await askQuestion(
      'Press Enter for default install or type "manual" for step-by-step install: '
    );

    if (setupType === 'manual') {
      await manualSetup();
    } else {
      await defaultSetup();
    }

    updateAppHtml();
    updateLayoutSvelte();
    createErrorPage();
    updateReadme();

    console.log('✅ SvelteKit project setup complete!');
    console.log(
      '📋 Check setup_install_result.log for detailed installation information.'
    );
  } catch (error) {
    console.error('❌ An error occurred during setup:', error);
  } finally {
    rl.close();
    closeLogging();
  }
}

async function defaultSetup() {
  console.log('📦 Installing SvelteKit...');
  await installFeature('SvelteKit', installSvelteKit);
  await installFeature('adapter-node', installAdapterNode);
  await installFeature('Tailwind CSS', installTailwindCSS);
  await installFeature('Tailwind Typography', installTailwindTypography);
  await installFeature('Font Awesome', installFontAwesome);
  await installFeature('PocketBase', installPocketBase);
  createGitignore();
  createFolders();
  createDemoPage();
  updateReadme();
  await finalSetup();
}

async function manualSetup() {
  console.log('🚀 Starting manual setup...');
  await promptAndInstall('Install SvelteKit?', installSvelteKit);
  await promptAndInstall('Install adapter-node?', installAdapterNode);
  await promptAndInstall('Install Tailwind CSS?', installTailwindCSS);
  await promptAndInstall(
    'Install Tailwind Typography?',
    installTailwindTypography
  );
  await promptAndInstall('Install Font Awesome?', installFontAwesome);
  await promptAndInstall('Install PocketBase?', installPocketBase);
  createGitignore();
  createFolders();
  createDemoPage();
  updateReadme();
  await finalSetup();
}

async function installFeature(name, installFunction) {
  console.log(`📦 Installing ${name}...`);
  await installFunction();
}

async function promptAndInstall(prompt, installFunction) {
  if ((await askQuestion(`${prompt} (y/n): `)) === 'y') {
    await installFunction();
  }
}

async function installSvelteKit() {
  runCommand('npm create svelte@latest .');
  runCommand('npm install');
}

async function installAdapterNode() {
  runCommand('npm install -D @sveltejs/adapter-node');
  updateFile(
    'svelte.config.js',
    (content) => `
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo: 'meta-shift',
      showToggleButton: 'always',
      toggleButtonPos: 'bottom-right'
    }
  }
};

export default config;`
  );
}

async function installTailwindCSS() {
  console.log('🎨 Setting up Tailwind CSS...');
  runCommand('npm install -D tailwindcss postcss autoprefixer');
  runCommand('npx tailwindcss init -p');
  updateFile('tailwind.config.js', (content) =>
    content
      .replace('content: []', "content: ['./src/**/*.{html,js,svelte,ts}']")
      .replace('plugins: [],', 'plugins: [],')
  );
  fs.writeFileSync(
    path.join('src', 'app.css'),
    `
@tailwind base;
@tailwind components;
@tailwind utilities;
`
  );
  fs.writeFileSync(
    path.join('src', 'routes', '+layout.svelte'),
    `
<script>
  import "../app.css";
</script>

<slot />
`
  );
}

async function installTailwindTypography() {
  runCommand('npm install -D @tailwindcss/typography');
  updateFile('tailwind.config.js', (content) =>
    content.replace(
      'plugins: [],',
      "plugins: [require('@tailwindcss/typography')],"
    )
  );
}

async function installFontAwesome() {
  runCommand(
    'npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/free-brands-svg-icons svelte-fa'
  );
}

async function installPocketBase() {
  runCommand('npm install pocketbase');
  fs.writeFileSync('.env', 'PB_URL=""');
  fs.writeFileSync(
    path.join('src', 'hooks.server.js'),
    `
import PocketBase from 'pocketbase';
import { PB_URL } from '$env/static/private';

export const handle = async ({ event, resolve }) => {
  event.locals.pb = new PocketBase(PB_URL);

  const response = await resolve(event);

  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({ httpOnly: false })
  );

  return response;
};
`
  );
}

function createGitignore() {
  console.log('📝 Creating .gitignore file...');
  const gitignoreContent = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Node.js dependencies
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# SvelteKit build output
/build
/.svelte-kit
/package

# Environment variables
.env
.env.*
!.env.example

# Tailwind CSS
/src/app.css.map
`;
  fs.writeFileSync('.gitignore', gitignoreContent);
}

function createFolders() {
  console.log('📁 Creating src/lib/components and src/lib/js folders...');
  fs.mkdirSync(path.join('src', 'lib', 'components'), { recursive: true });
  fs.mkdirSync(path.join('src', 'lib', 'js'), { recursive: true });
}

function createDemoPage() {
  console.log('📄 Creating demo page...');
  const demoPageContent = `
<script>
  import { Fa } from 'svelte-fa';
  import { faRocket, faCode, faPalette } from '@fortawesome/free-solid-svg-icons';
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<main class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-8 text-center text-zinc-800 dark:text-zinc-100">Welcome to Your SvelteKit Project!</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 flex items-center text-zinc-800 dark:text-zinc-100">
        <Fa icon={faRocket} class="mr-2 text-blue-500" />
        SvelteKit with adapter-node
      </h2>
      <p class="text-zinc-700 dark:text-zinc-300">Your project is set up with SvelteKit and adapter-node for server-side rendering and deployment flexibility.</p>
    </div>

    <div class="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 flex items-center text-zinc-800 dark:text-zinc-100">
        <Fa icon={faPalette} class="mr-2 text-purple-500" />
        Tailwind CSS
      </h2>
      <p class="text-zinc-700 dark:text-zinc-300">Enjoy the power of utility-first CSS with Tailwind. This entire page is styled using Tailwind classes!</p>
    </div>

    <div class="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 flex items-center text-zinc-800 dark:text-zinc-100">
        <Fa icon={faCode} class="mr-2 text-green-500" />
        Tailwind Typography
      </h2>
      <div class="prose prose-sm dark:prose-invert">
        <p>This paragraph is styled with Tailwind Typography. It provides a set of sensible default typography styles so your content looks great right out of the box.</p>
        <ul>
          <li>Easy to read lists</li>
          <li>With proper spacing</li>
          <li>And bullet styling</li>
        </ul>
      </div>
    </div>

    <div class="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-4 flex items-center text-zinc-800 dark:text-zinc-100">
        <Fa icon={faGithub} class="mr-2 text-zinc-700 dark:text-zinc-300" />
        Font Awesome Icons
      </h2>
      <p class="text-zinc-700 dark:text-zinc-300">Font Awesome icons are integrated and easy to use with the svelte-fa component.</p>
      <div class="flex justify-center space-x-4 mt-4">
        <Fa icon={faRocket} size="2x" class="text-blue-500" />
        <Fa icon={faCode} size="2x" class="text-green-500" />
        <Fa icon={faPalette} size="2x" class="text-purple-500" />
        <Fa icon={faGithub} size="2x" class="text-zinc-700 dark:text-zinc-300" />
      </div>
    </div>
  </div>

  <div class="mt-12 text-center">
    <p class="text-zinc-600 dark:text-zinc-400">Edit this page in <code class="bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded">src/routes/+page.svelte</code> to start building your app!</p>
  </div>
</main>
`;
  fs.writeFileSync(path.join('src', 'routes', '+page.svelte'), demoPageContent);
}

function updateReadme() {
  console.log('📝 Updating README.md...');
  const features = [
    fs.existsSync('svelte.config.js') ? 'SvelteKit' : '',
    fs.existsSync('svelte.config.js') &&
    fs
      .readFileSync('svelte.config.js', 'utf8')
      .includes('@sveltejs/adapter-node')
      ? 'SvelteKit with adapter-node'
      : '',
    fs.existsSync('tailwind.config.js') ? 'Tailwind CSS' : '',
    fs.existsSync('tailwind.config.js') &&
    fs
      .readFileSync('tailwind.config.js', 'utf8')
      .includes('@tailwindcss/typography')
      ? 'Tailwind Typography'
      : '',
    fs.existsSync('package.json') &&
    fs.readFileSync('package.json', 'utf8').includes('svelte-fa')
      ? 'Font Awesome Icons'
      : '',
    fs.existsSync('package.json') &&
    fs.readFileSync('package.json', 'utf8').includes('pocketbase')
      ? 'PocketBase'
      : '',
    fs.existsSync('svelte.config.js') &&
    fs.readFileSync('svelte.config.js', 'utf8').includes('inspector')
      ? 'Svelte Inspector'
      : '',
    fs.existsSync(path.join('src', 'app.html')) &&
    fs
      .readFileSync(path.join('src', 'app.html'), 'utf8')
      .includes('dark:prose-invert')
      ? 'Dark mode support'
      : '',
    fs.existsSync(path.join('src', 'routes', '+layout.svelte')) &&
    fs
      .readFileSync(path.join('src', 'routes', '+layout.svelte'), 'utf8')
      .includes('<nav')
      ? 'Responsive navigation'
      : '',
    fs.existsSync(path.join('src', 'routes', '+error.svelte'))
      ? 'Custom error page'
      : '',
  ].filter(Boolean);

  const readmeContent = `
# SvelteKit Project Setup

## Part 1: What does setup.mjs do?

The \`setup.mjs\` script is a custom setup tool for SvelteKit projects. It provides the following options:

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

${features.map((feature) => `- ${feature}`).join('\n')}

## Getting Started

${
  fs.existsSync('.env')
    ? 'Set the `PB_URL` in your `.env` file to your PocketBase server URL.\n\n'
    : ''
}
${
  features.includes('SvelteKit')
    ? 'Run `npm run dev` to start the development server.\n'
    : ''
}

${
  features.includes('Svelte Inspector')
    ? `
## Using Svelte Inspector

- On macOS: Press Command + Shift
- On other systems: Press Ctrl + Shift

The inspector toggle button will always be visible in the bottom-right corner of your app.
`
    : ''
}

## Additional Information

For more details on how to use SvelteKit, Tailwind CSS, or any of the other installed features, please refer to their respective documentation.

Happy coding!
`;

  fs.writeFileSync('README.md', readmeContent);
}

async function finalSetup() {
  if ((await askQuestion('Initialize git repository? (y/n): ')) === 'y') {
    console.log('🏁 Initializing git repository...');
    runCommand('git init && git add -A && git commit -m "Initial commit"');
  }

  if ((await askQuestion('Start development server? (y/n): ')) === 'y') {
    console.log('🚀 Starting development server...');
    runCommand('npm run dev -- --host --open');
  }

  console.log('✅ SvelteKit project setup complete!');
  if (fs.existsSync('.env')) {
    console.log(
      '\n⚠️  Important: Before running your app, make sure to set the PB_URL in your .env file to your PocketBase server URL.'
    );
  }
  if (
    fs.existsSync('svelte.config.js') &&
    fs.readFileSync('svelte.config.js', 'utf8').includes('inspector')
  ) {
    console.log('\n🔍 To use Svelte Inspector:');
    console.log('  - On macOS: Press Command + Shift');
    console.log('  - On other systems: Press Ctrl + Shift');
    console.log(
      'The inspector toggle button will always be visible in the bottom-right corner of your app.'
    );
  }
  console.log(
    '\n📋 A demo page has been created at src/routes/+page.svelte to showcase the installed features.'
  );
  console.log(
    '   Feel free to modify or replace it as you build your application.'
  );
}

function updateAppHtml() {
  console.log('📝 Updating app.html...');
  const appHtmlPath = path.join('src', 'app.html');
  if (fs.existsSync(appHtmlPath)) {
    updateFile(appHtmlPath, (content) => {
      return content.replace(
        /<body[^>]*>[\s\S]*?<\/body>/,
        `<body
    data-sveltekit-preload-data="hover"
    class="flex flex-col min-h-dvh px-4 overflow-y-auto dark:prose-invert bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-100 max-w-7xl mx-auto"
  >
    <div style="display: contents" class="flex-grow mx-auto">
      %sveltekit.body%
    </div>
  </body>`
      );
    });
  } else {
    console.log('⚠️ app.html not found. Skipping update.');
  }
}

function updateLayoutSvelte() {
  console.log('📝 Updating +layout.svelte...');
  const layoutPath = path.join('src', 'routes', '+layout.svelte');
  if (fs.existsSync(layoutPath)) {
    const layoutContent = `
<script>
  import "../app.css";
  import { Fa } from 'svelte-fa';
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faHome, faInfoCircle, faEnvelope, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="flex flex-col min-h-screen">
  <nav class="bg-zinc-200 dark:bg-zinc-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <a href="/" class="text-xl font-bold text-zinc-800 dark:text-zinc-100">Your Logo</a>
      <ul class="flex space-x-4">
        <li><a href="/" class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100 flex items-center"><Fa icon={faHome} class="mr-2" />Home</a></li>
        <li><a href="/about" class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100 flex items-center"><Fa icon={faInfoCircle} class="mr-2" />About</a></li>
        <li><a href="/contact" class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100 flex items-center"><Fa icon={faEnvelope} class="mr-2" />Contact</a></li>
      </ul>
    </div>
  </nav>

  <main class="flex-grow container mx-auto px-4 py-8">
    <slot />
  </main>

  <footer class="bg-zinc-200 dark:bg-zinc-800 p-4 mt-8">
    <div class="container mx-auto flex justify-between items-center">
      <p class="text-zinc-600 dark:text-zinc-300">&copy; 2023 Your Company. All rights reserved.</p>
      <div class="flex space-x-4">
        <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-300 dark:hover:text-zinc-100">
          <Fa icon={faGithub} size="lg" />
        </a>
        <!-- Add more social media icons as needed -->
      </div>
    </div>
  </footer>
</div>
`;
    fs.writeFileSync(layoutPath, layoutContent);
  } else {
    console.log('⚠️ +layout.svelte not found. Skipping update.');
  }
}

function createErrorPage() {
  console.log('📄 Creating +error.svelte page...');
  const errorPageContent = `
<script>
  import { page } from '$app/stores';
  import { Fa } from 'svelte-fa';
  import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
  <Fa icon={faExclamationTriangle} class="text-6xl mb-4 text-yellow-500" />
  <h1 class="text-4xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">
    {$page.status}: {$page.error.message}
  </h1>
  <p class="text-xl mb-4 text-zinc-600 dark:text-zinc-300">
    Oops! Something went wrong.
  </p>
  <a
    href="/"
    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
  >
    Go back home
  </a>
</div>
`;
  fs.writeFileSync(
    path.join('src', 'routes', '+error.svelte'),
    errorPageContent
  );
}

setupProcess();
