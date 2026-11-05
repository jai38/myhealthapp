// The sample and boundary-test files in the document picker are developer tools.
// They must never be offered in a release build, where __DEV__ is false.
export function areTestSamplesEnabled(isDev: boolean): boolean {
  return isDev === true;
}
