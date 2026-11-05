import { describe, it, expect } from 'vitest';
import { GALLERY_PATH, isGalleryEnabled, isGalleryPath } from '../../design/gallery/galleryGuard';

describe('gallery guard', () => {
  it('is unreachable in a release build', () => {
    expect(isGalleryEnabled(false)).toBe(false);
  });

  it('is reachable in a development build', () => {
    expect(isGalleryEnabled(true)).toBe(true);
  });

  it('matches only the gallery path', () => {
    expect(isGalleryPath(GALLERY_PATH)).toBe(true);
    expect(isGalleryPath(`${GALLERY_PATH}/inputs`)).toBe(true);
    expect(isGalleryPath('/')).toBe(false);
    expect(isGalleryPath('/dev/gallery-other')).toBe(false);
    expect(isGalleryPath('/medications')).toBe(false);
    expect(isGalleryPath(null)).toBe(false);
    expect(isGalleryPath(undefined)).toBe(false);
  });
});
