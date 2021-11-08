export type ModuleGroupManager<ModuleType> = {
  /**
   * Gets an array with information of each module inside a module group.
   *
   * @returns An array with information of each detected module, containing:
   * - module ID
   * - module's absolute path
   * - module's relative path
   * - loaded module
   */
  getModuleGroupInfo(): Map<string, ModuleInfo<ModuleType>>;

  /**
   * Resets the cache of found modules inside a module group.
   */
  reset(): void;
};

export type ModuleInfo<ModuleType> = {
  /**
   * Module ID.
   *
   * Given the following modules, their IDs are:
   * - main.hook.js: main
   * - dir/main.hook.js: dir/main
   * - dir/taxonomy.hook.js: dir/taxonomy
   */
  id: string;

  /**
   * Module's absolute path.
   */
  absolutePath: string;

  /**
   * Module's relative path inside module group directory.
   */
  relativePath: string;

  /**
   * Gets a module, loading it if not already loaded.
   */
  getModule(): ModuleType;
};
