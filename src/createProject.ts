import path from 'path';
import fs from 'fs-extra';
import ora, { Ora } from 'ora';
import logger from './utils/logger.js';
import { copyTemplate, replacePlaceholders } from './utils/copyTemplate.js';
import { runCommand, commandExists } from './utils/runCommand.js';
import type { CliOptions, TemplateMap } from './types/index.js';

const validateProjectName = (projectName: string): void => {
  const validNameRegex = /^[a-z0-9-_]+$/i;

  if (!validNameRegex.test(projectName)) {
    throw new Error('Project name can only contain letters, numbers, hyphens, and underscores');
  }

  const reservedNames = ['node_modules', 'src', 'test', 'tests'];
  if (reservedNames.includes(projectName.toLowerCase())) {
    throw new Error(`"${projectName}" is a reserved name and cannot be used`);
  }

  if (projectName.length < 1 || projectName.length > 214) {
    throw new Error('Project name must be between 1 and 214 characters');
  }
};

const isDirEmpty = async (dirPath: string): Promise<boolean> => {
  try {
    const files = await fs.readdir(dirPath);
    return files.length === 0;
  } catch {
    return true;
  }
};

const createProjectDirectory = async (
  projectName: string,
  options: CliOptions
): Promise<string> => {
  const { verbose } = options;
  const projectPath = path.resolve(process.cwd(), projectName);

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

const copyTemplateFiles = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { template = 'full', verbose } = options;
  const spinner: Ora = ora('Copying template files...').start();

  try {
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

    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    logger.debug('Updated package.json', verbose);

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

const installDependencies = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { install = true, verbose } = options;

  if (!install) {
    logger.warn('Skipping dependency installation (--no-install flag)');
    return;
  }

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

const initializeGit = async (projectPath: string, options: CliOptions): Promise<void> => {
  const { git = false, verbose } = options;

  if (!git) {
    return;
  }

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

const createProject = async (projectName: string, options: CliOptions = {}): Promise<string> => {
  try {
    logger.step('Validating project name...');
    validateProjectName(projectName);
    logger.success(`Project name "${projectName}" is valid`);
    logger.blank();

    logger.step('Creating project directory...');
    const projectPath = await createProjectDirectory(projectName, options);
    logger.success(`Project directory created: ${projectName}`);
    logger.blank();

    logger.step('Setting up project structure...');
    await copyTemplateFiles(projectPath, options);
    logger.blank();

    logger.step('Updating project configuration...');
    await updateProjectConfig(projectPath, projectName, options);
    logger.blank();

    if (options.install !== false) {
      logger.step('Installing dependencies...');
      await installDependencies(projectPath, options);
      logger.blank();
    }

    if (options.git) {
      logger.step('Initializing git repository...');
      await initializeGit(projectPath, options);
      logger.blank();
    }

    return projectPath;
  } catch (error) {
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
