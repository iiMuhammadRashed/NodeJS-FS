/**
 * Project Creator
 *
 * Main logic for scaffolding a new Express backend project.
 * This module coordinates all the steps needed to create a
 * production-ready backend application.
 */

import path from 'path';
import fs from 'fs-extra';
import ora, { Ora } from 'ora';
import logger from './utils/logger.js';
import { copyTemplate, replacePlaceholders } from './utils/copyTemplate.js';
import { runCommand, commandExists } from './utils/runCommand.js';
import type { CliOptions, TemplateMap } from './types/index.js';

/**
 * Validate project name
 *
 * @param projectName - Project name to validate
 * @throws Error if project name is invalid
 */
const validateProjectName = (projectName: string): void => {
  // Check for invalid characters
  const validNameRegex = /^[a-z0-9-_]+$/i;

  if (!validNameRegex.test(projectName)) {
    throw new Error('Project name can only contain letters, numbers, hyphens, and underscores');
  }

  // Check for reserved names
  const reservedNames = ['node_modules', 'src', 'test', 'tests'];
  if (reservedNames.includes(projectName.toLowerCase())) {
    throw new Error(`"${projectName}" is a reserved name and cannot be used`);
  }

  // Check length
  if (projectName.length < 1 || projectName.length > 214) {
    throw new Error('Project name must be between 1 and 214 characters');
  }
};

/**
 * Check if directory exists and is empty
 *
 * @param dirPath - Directory path to check
 * @returns Promise that resolves to true if directory is empty
 */
const isDirEmpty = async (dirPath: string): Promise<boolean> => {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch {
    return true; // Directory doesn't exist, so it's "empty"
  }
};

/**
 * Create project directory
 *
 * @param projectName - Project name
 * @param options - Options including verbose
 * @returns Promise that resolves to absolute path to project directory
 */
const createProjectDirectory = async (
  projectName: string,
  options: CliOptions
): Promise<string> => {
  const { verbose } = options;
  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    const isEmpty = await isDirEmpty(projectPath);

    if (!isEmpty) {
      throw new Error(
        `Directory "${projectName}" already exists and is not empty. ` +
          'Please choose a different name or remove the existing directory.'
      );
    }

    logger.debug(`Using existing empty directory: ${projectPath}`, verbose);
  } else {
    await fs.ensureDir(projectPath);
    logger.debug(`Created directory: ${projectPath}`, verbose);
  }

  return projectPath;
};

/**
 * Copy template files to project
 *
 * @param projectPath - Target project path
 * @param options - Options including template and verbose
 * @returns Promise that resolves when copy is complete
 */
const copyTemplateFiles = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { template = 'full', verbose } = options;
  const spinner: Ora = ora('Copying template files...').start();

  try {
    // Map template option to actual template name
    const templateMap: TemplateMap = {
      basic: 'base-backend',
      secure: 'base-backend',
      full: 'base-backend',
    };

    const templateName = templateMap[template] || 'base-backend';

    await copyTemplate(templateName, projectPath, { verbose });

    spinner.succeed('Template files copied');
  } catch (error) {
    spinner.fail('Failed to copy template files');
    throw error;
  }
};

/**
 * Update project configuration
 *
 * @param projectPath - Project path
 * @param projectName - Project name
 * @param options - Options including verbose
 * @returns Promise that resolves when configuration is updated
 */
const updateProjectConfig = async (
  projectPath: string,
  projectName: string,
  options: CliOptions
): Promise<void> => {
  const { verbose } = options;
  const spinner: Ora = ora('Configuring project...').start();

  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const readmePath = path.join(projectPath, 'README.md');

    // Read and update package.json
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    logger.debug('Updated package.json', verbose);

    // Replace placeholders in README.md
    if (await fs.pathExists(readmePath)) {
      await replacePlaceholders(readmePath, { PROJECT_NAME: projectName });
      logger.debug('Updated README.md', verbose);
    }

    spinner.succeed('Project configured');
  } catch (error) {
    spinner.fail('Failed to configure project');
    throw error;
  }
};

/**
 * Install dependencies
 *
 * @param projectPath - Project path
 * @param options - Options including install and verbose
 * @returns Promise that resolves when installation is complete
 */
const installDependencies = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { install = true, verbose } = options;

  if (!install) {
    logger.warn('Skipping dependency installation (--no-install flag)');
    return;
  }

  // Check if npm is available
  const hasNpm = await commandExists('npm');
  if (!hasNpm) {
    logger.warn('npm not found. Skipping dependency installation.');
    logger.info('Please install dependencies manually with: npm install');
    return;
  }

  const spinner: Ora = ora('Installing dependencies (this may take a few minutes)...').start();

  try {
    await runCommand('npm', ['install'], {
      cwd: projectPath,
      verbose,
    });

    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    logger.warn('You can install dependencies manually by running: npm install');

    if (verbose) {
      throw error;
    }
  }
};

/**
 * Initialize git repository
 *
 * @param projectPath - Project path
 * @param options - Options including git and verbose
 * @returns Promise that resolves when git is initialized
 */
const initializeGit = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { git = false, verbose } = options;

  if (!git) {
    return;
  }

  // Check if git is available
  const hasGit = await commandExists('git');
  if (!hasGit) {
    logger.warn('git not found. Skipping git initialization.');
    return;
  }

  const spinner: Ora = ora('Initializing git repository...').start();

  try {
    await runCommand('git', ['init'], {
      cwd: projectPath,
      verbose,
    });

    // Create initial commit
    await runCommand('git', ['add', '.'], {
      cwd: projectPath,
      verbose,
    });

    await runCommand('git', ['commit', '-m', 'Initial commit from nodejs-fs'], {
      cwd: projectPath,
      verbose,
    });

    spinner.succeed('Git repository initialized');
  } catch (error) {
    spinner.fail('Failed to initialize git repository');

    if (verbose) {
      throw error;
    }
  }
};

/**
 * Main project creation function
 *
 * @param projectName - Name of the project
 * @param options - CLI options
 * @returns Promise that resolves to project path
 */
const createProject = async (projectName: string, options: CliOptions = {}): Promise<string> => {
  try {
    // Step 1: Validate project name
    logger.step('Validating project name...');
    validateProjectName(projectName);
    logger.success(`Project name "${projectName}" is valid`);
    logger.blank();

    // Step 2: Create project directory
    logger.step('Creating project directory...');
    const projectPath = await createProjectDirectory(projectName, options);
    logger.success(`Project directory created: ${projectName}`);
    logger.blank();

    // Step 3: Copy template files
    logger.step('Setting up project structure...');
    await copyTemplateFiles(projectPath, options);
    logger.blank();

    // Step 4: Update configuration
    logger.step('Updating project configuration...');
    await updateProjectConfig(projectPath, projectName, options);
    logger.blank();

    // Step 5: Install dependencies
    if (options.install !== false) {
      logger.step('Installing dependencies...');
      await installDependencies(projectPath, options);
      logger.blank();
    }

    // Step 6: Initialize git (if requested)
    if (options.git) {
      logger.step('Initializing git repository...');
      await initializeGit(projectPath, options);
      logger.blank();
    }

    // Success!
    return projectPath;
  } catch (error) {
    // Enhance error message
    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === 'EACCES') {
        throw new Error('Permission denied. Try running with elevated privileges.');
      }

      if (nodeError.code === 'ENOSPC') {
        throw new Error('Not enough disk space available.');
      }
    }

    throw error;
  }
};

export default createProject;
