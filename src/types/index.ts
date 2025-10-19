export interface CliOptions {
  install?: boolean;
  git?: boolean;
  template?: 'basic' | 'secure' | 'full';
  verbose?: boolean;
  typescript?: boolean;
}

export type TemplateName = 'base-backend';

export interface TemplateMap {
  [key: string]: TemplateName;
}

export interface CopyTemplateOptions {
  verbose?: boolean;
}

export interface RunCommandOptions {
  cwd?: string;
  verbose?: boolean;
}

export interface Replacements {
  [key: string]: string;
}

export interface PackageJson {
  name: string;
  version?: string;
  description?: string;
  [key: string]: unknown;
}
