// The component gallery (Y4) is a developer tool. It must never be reachable in
// a release build, where __DEV__ is false.
export const GALLERY_PATH = '/dev/gallery';

export function isGalleryEnabled(isDev: boolean): boolean {
  return isDev === true;
}

export function isGalleryPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === GALLERY_PATH || pathname.startsWith(`${GALLERY_PATH}/`);
}
