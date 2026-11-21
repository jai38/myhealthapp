// TEST ONLY. Runs first (before setup.tsx and before any test imports React Native Testing
// Library). Packages loaded by Node itself, such as RNTL, which is CommonJS, bypass Vite's alias,
// so their `require('react-native')` is pointed at the same stand-in here.
import Module from 'node:module';
import * as reactNativeShim from './react-native';

type ModuleLoader = { _load: (request: string, ...rest: unknown[]) => unknown };
const loader = Module as unknown as ModuleLoader;
const originalLoad = loader._load;
loader._load = function load(this: unknown, request: string, ...rest: unknown[]) {
  if (request === 'react-native') return reactNativeShim;
  return originalLoad.call(this, request, ...rest);
};
