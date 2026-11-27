// TEST ONLY. Stand-in for expo-clipboard.
let text = '';
export async function getStringAsync(): Promise<string> {
  return text;
}
export async function setStringAsync(value: string): Promise<boolean> {
  text = value;
  return true;
}
export function __setClipboard(value: string): void {
  text = value;
}
