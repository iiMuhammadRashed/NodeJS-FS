#!/usr/bin/env node

/**
 * nodejs-fs CLI Entry Point
 *
 * This is the main CLI entry point that handles command-line arguments
 * and initiates project scaffolding.
 *
 * Usage:
 *   npx nodejs-fs <project-name> [options]
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import createProject from './createProject.js';
import type { CliOptions } from './types/index.js';

// Get current file directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version info
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8')) as {
  version: string;
  name: string;
};

// Initialize CLI program
const program = new Command();

program
  .name('nodejs-fs')
  .description('🚀 Generate a production-ready Express + Mongoose backend')
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .argument('<project-name>', 'Name of your project')
  .option('--no-install', 'Skip npm install')
  .option('--git', 'Initialize git repository')
  .option('--template <type>', 'Template type: basic, secure, full', 'full')
  .option('--verbose', 'Show detailed logs')
  .option('--typescript', '[TODO] Use TypeScript (not implemented yet)')
  .action(async (projectName: string, options: CliOptions) => {
    try {
      // Display banner
      console.log();
      console.log(chalk.cyan.bold('╔═══════════════════════════════════════════╗'));
      console.log(chalk.cyan.bold('║                                           ║'));
      console.log(chalk.cyan.bold('         🚀 NODEJS-FS Generator 🚀          '));
      console.log(chalk.cyan.bold('║                                           ║'));
      console.log(chalk.cyan.bold('╚═══════════════════════════════════════════╝'));
      console.log();

      // Check for TypeScript option (placeholder)
      if (options.typescript) {
        console.log(chalk.yellow('⚠️  TypeScript support is coming soon!'));
        console.log(chalk.yellow('    Generating JavaScript project for now...\n'));
      }

      // Create the project
      await createProject(projectName, options);

      // Success message
      console.log();
      console.log(chalk.green.bold('✨ ════════════════════════════════════════ ✨'));
      console.log(chalk.green.bold('   🎉 PROJECT CREATED SUCCESSFULLY! 🎉'));
      console.log(chalk.green.bold('✨ ════════════════════════════════════════ ✨'));
      console.log();
      console.log(chalk.cyan('📁 Your project is ready at:'), chalk.white.bold(`./${projectName}`));
      console.log();
      console.log(chalk.yellow('📝 Next steps:'));
      console.log();
      console.log(chalk.white(`   cd ${projectName}`));

      if (!options.install) {
        console.log(chalk.white('   npm install'));
      }

      console.log(chalk.white('   cp .env.example .env'));
      console.log(chalk.white('   # Edit .env with your configuration'));
      console.log(chalk.white('   npm run dev'));
      console.log();
      console.log(chalk.cyan('📚 Documentation:'), chalk.white('README.md'));
      console.log();
      console.log(chalk.magenta('Happy coding! 💻✨'));
      console.log();
    } catch (error) {
      console.error();
      console.error(
        chalk.red.bold('❌ ERROR:'),
        chalk.red(error instanceof Error ? error.message : String(error))
      );
      console.error();

      if (options.verbose && error instanceof Error && error.stack) {
        console.error(chalk.gray(error.stack));
      }

      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
