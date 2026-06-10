import { Capacitor, registerPlugin } from '@capacitor/core';

export interface SchemeTarget {
  uri?: string;
  scheme?: string;
  host?: string;
  path?: string;
}

export interface LaunchableApp {
  package: string;
  label: string;
  icon: string; // base64 PNG data URI
}

export interface AppScannerPlugin {
  /** Returns the subset of `packages` that are installed (or all installed apps if omitted). */
  getInstalled(options: { packages?: string[] }): Promise<{ installed: string[] }>;
  /** Returns every launchable app on the device with label and icon. */
  getLaunchableApps(): Promise<{ apps: LaunchableApp[] }>;
  /** Returns whether a BROWSABLE activity handles the URI, and which packages do. */
  resolveScheme(options: SchemeTarget): Promise<{ resolves: boolean; packages: string[] }>;
  /** Launches the deep link as a BROWSABLE VIEW intent. */
  openUri(options: SchemeTarget): Promise<void>;
  /** Launches an installed app by its package name. */
  launchPackage(options: { package: string }): Promise<void>;
}

const AppScanner = registerPlugin<AppScannerPlugin>('AppScanner');

export const isNative = Capacitor.isNativePlatform();
export default AppScanner;
