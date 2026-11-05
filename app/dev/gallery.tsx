import React from 'react';
import { Redirect } from 'expo-router';
import { Gallery } from '../../design/gallery/Gallery';
import { isGalleryEnabled } from '../../design/gallery/galleryGuard';

export default function GalleryRoute() {
  if (!isGalleryEnabled(__DEV__)) return <Redirect href="/" />;
  return <Gallery />;
}
