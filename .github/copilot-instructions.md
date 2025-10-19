# nodejs-fs CLI Generator - AI Coding Instructions

## Project Overview

**nodejs-fs** is a TypeScript-based CLI tool that scaffolds production-ready Express.js + MongoDB backend projects. It's published to npm as a global command (`create-nodejs-fs`) that copies template files and configures new projects.

## Architecture

### Dual Codebase Structure
- **CLI Source** (`src/`): TypeScript CLI tool compiled to `dist/`
- **Template Files** (`lib/templates/base-backend/`): JavaScript Express backend that gets copied to generated projects
- **Critical**: Changes to the CLI affect the generator; changes to templates affect generated projects

### Key Workflow
1. User runs `npx create-nodejs-fs my-project`
2. `dist/cli.js` (compiled from `src/cli.ts`) parses arguments via Commander.js
3. `createProject()` orchestrates: validate → create dir → copy template → configure → install deps
4. Template files from `lib/templates/base-backend/` are copied via `fs-extra`
5. Placeholders like `{{PROJECT_NAME}}` in `package.json` are replaced

## Build & Publish Workflow

```bash
# Development
npm run dev           # TypeScript watch mode (tsc --watch)
npm run build         # Compile TypeScript to dist/

# Publishing (critical sequence)
npm run prepublishOnly  # Auto-runs: typecheck → lint → build
npm version patch       # Bump version (1.0.0 → 1.0.1)
npm publish             # Publishes dist/ and lib/templates/ to npm
```

**Important**: The `prepublishOnly` script ensures TypeScript is compiled before every publish. Never publish without building.

## TypeScript Configuration

- **Module System**: ESM (`"type": "module"` in package.json)
- **ES Module Interop**: Use `import.meta.url` and `fileURLToPath()` for `__dirname` equivalent
- **Strict Mode**: Enabled with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- **Excludes**: `lib/templates/` excluded from compilation (templates are plain JavaScript)

## Template System

### Template Structure
Templates live in `lib/templates/base-backend/` with this pattern:
- Express app with MVC architecture (models, controllers, routes, middlewares)
- Security: JWT auth, bcrypt, helmet, rate limiting, XSS protection
- Features: Cloudinary image uploads, Nodemailer, Winston logging
- Configuration: `.env.example` with placeholders

### Placeholder Replacement
Use `{{PLACEHOLDER}}` syntax in template files. The `replacePlaceholders()` utility performs simple regex replacement:
```typescript
// In lib/templates/base-backend/package.json
"name": "{{PROJECT_NAME}}"

// Gets replaced when project is created
"name": "my-awesome-api"
```

### Modifying Templates
When editing template files (`lib/templates/base-backend/`):
1. Test by running the CLI locally: `npm run build && node dist/cli.js test-project`
2. Verify generated project works: `cd test-project && npm install && npm run dev`
3. Templates are published as-is to npm (not compiled), so syntax must be Node-compatible

## Code Patterns

### Error Handling
Use consistent error throwing with context:
```typescript
throw new Error(`Failed to copy template: ${errorMessage}`);
```

### Logging
Use the custom logger (`src/utils/logger.ts`) for consistent output:
```typescript
logger.step('Creating project directory...');
logger.success('Project created!');
logger.debug('Verbose info', verbose);
```

### Async Patterns
- Prefer async/await over promises
- Use `ora` spinners for long-running tasks (copying, installing)
- Coordinate spinner success/fail messages with try/catch blocks

### Command Execution
Use `runCommand()` utility with proper error handling:
```typescript
await runCommand('npm', ['install'], { cwd: projectPath, verbose });
```

## CLI Design Decisions

### Why Commander.js
Simple argument parsing with built-in help generation. The `.action()` callback receives parsed options as typed `CliOptions`.

### Why Separate Steps
`createProject()` breaks scaffolding into discrete steps (validate → create → copy → configure → install) for:
- Clear progress indication via spinners
- Easier debugging with `--verbose` flag
- Graceful failure handling (e.g., skip git init if git not found)

### Why ora + chalk
- `ora`: Animated spinners for long tasks (better UX than console.log)
- `chalk`: Colored output (success=green, errors=red, steps=cyan)

## Testing Generated Projects

To manually test after changes:
```bash
npm run build
node dist/cli.js test-backend --verbose
cd test-backend
cp .env.example .env
npm run dev
# Test endpoints: curl http://localhost:5000/api/auth/register -X POST ...
```

## Common Pitfall

**Don't confuse the two codebases:**
- Fixing a bug in the *generated* backend? → Edit `lib/templates/base-backend/`
- Fixing a bug in the *CLI tool*? → Edit `src/`

## File Organization

```
src/
  cli.ts              # Entry point, Commander setup, banner display
  createProject.ts    # Main orchestration logic
  types/index.ts      # TypeScript interfaces (CliOptions, etc.)
  utils/
    copyTemplate.ts   # Template copying + placeholder replacement
    runCommand.ts     # Shell command execution
    logger.ts         # Colored console output

lib/templates/base-backend/  # Express template (copied to generated projects)
  src/
    controllers/      # authController, productController
    models/          # User, Product (Mongoose schemas)
    routes/          # API route definitions
    middlewares/     # auth, errorHandler, validation
    config/          # MongoDB, Cloudinary, Winston setup
```

## Dependencies

- **Runtime** (user-facing): `chalk`, `commander`, `fs-extra`, `ora`
- **DevDeps** (build tools): TypeScript, ESLint, Prettier, rimraf
- **Template deps**: See `lib/templates/base-backend/package.json` (Express ecosystem)

## Publishing Checklist

Before `npm publish`:
1. Update version: `npm version patch/minor/major`
2. Update changelog in README.md
3. Test CLI: `npm run build && node dist/cli.js test-app`
4. Verify dist/ is compiled (should see .js, .d.ts, .map files)
5. Check package.json `files` field includes `dist/` and `lib/templates/`
