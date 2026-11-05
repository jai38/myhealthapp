import React, { useState } from 'react';
import { View } from 'react-native';
import { GalleryItem, GallerySection } from '../GallerySection';
import {
  EmptyState,
  ErrorState,
  OfflineBanner,
  PermissionPrompt,
  ProgressBar,
  Skeleton,
  SkeletonGroup,
  SyncIndicator,
  Toast,
} from '../../components/Feedback';
import { Button } from '../../components/Actions';
import { color, radius, space } from '../../tokens';

export function FeedbackSection() {
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <GallerySection title="Feedback" testID="gallery-feedback">
      <GalleryItem label="Skeleton: line, block and circle">
        <SkeletonGroup>
          <Skeleton shape="line" />
          <Skeleton shape="block" />
          <Skeleton shape="circle" />
        </SkeletonGroup>
      </GalleryItem>

      <GalleryItem label="EmptyState: first time">
        <EmptyState
          icon="document-text-outline"
          title="No records yet"
          body="Add a prescription or a lab report to start Asha Rao's record."
          action={{ label: 'Add a record', onPress: () => undefined }}
        />
      </GalleryItem>

      <GalleryItem label="EmptyState: filtered">
        <EmptyState
          title="No results"
          body="Nothing matches the current filters."
          secondaryAction={{ label: 'Clear all', onPress: () => undefined }}
        />
      </GalleryItem>

      <GalleryItem label="ErrorState: default">
        <ErrorState onRetry={() => undefined} />
      </GalleryItem>

      <GalleryItem label="ErrorState: retrying">
        <ErrorState onRetry={() => undefined} retrying />
      </GalleryItem>

      <GalleryItem label="OfflineBanner: without lastUpdated">
        <OfflineBanner />
      </GalleryItem>

      <GalleryItem label="OfflineBanner: with lastUpdated">
        <OfflineBanner lastUpdated="09:40" />
      </GalleryItem>

      <GalleryItem label="SyncIndicator: synced (full and compact)">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <SyncIndicator state="synced" />
          <SyncIndicator state="synced" compact />
        </View>
      </GalleryItem>

      <GalleryItem label="SyncIndicator: pending (full and compact)">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <SyncIndicator state="pending" />
          <SyncIndicator state="pending" compact />
        </View>
      </GalleryItem>

      <GalleryItem label="SyncIndicator: error (full and compact)">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <SyncIndicator state="error" />
          <SyncIndicator state="error" compact />
        </View>
      </GalleryItem>

      <GalleryItem label="Toast">
        {/* Toast is absolutely positioned, so it is shown inside a fixed, relatively positioned box. */}
        <View style={{ gap: space.sm }}>
          <Button label="Show toast" variant="secondary" onPress={() => setToastVisible(true)} />
          <View
            style={{
              height: 80,
              position: 'relative',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: color.border.subtle,
              borderRadius: radius.md,
            }}
          >
            <Toast
              message="Saved to Asha Rao's records"
              visible={toastVisible}
              onHide={() => setToastVisible(false)}
            />
          </View>
        </View>
      </GalleryItem>

      <GalleryItem label="ProgressBar: 0">
        <ProgressBar progress={0} />
      </GalleryItem>

      <GalleryItem label="ProgressBar: 0.45">
        <ProgressBar progress={0.45} />
      </GalleryItem>

      <GalleryItem label="ProgressBar: 1">
        <ProgressBar progress={1} />
      </GalleryItem>

      <GalleryItem label="ProgressBar: indeterminate">
        <ProgressBar />
      </GalleryItem>

      <GalleryItem label="ProgressBar: with processing note">
        <ProgressBar progress={0.7} showProcessingNote />
      </GalleryItem>

      <GalleryItem label="PermissionPrompt: camera, ask">
        <PermissionPrompt
          icon="camera-outline"
          title="Allow camera access?"
          body="Ayoreni uses the camera to photograph a prescription or a lab report."
          stillWorks="You can still pick a photo from your files."
          state="ask"
          onAllow={() => undefined}
          onOpenSettings={() => undefined}
          onNotNow={() => undefined}
        />
      </GalleryItem>

      <GalleryItem label="PermissionPrompt: camera, denied">
        <PermissionPrompt
          icon="camera-outline"
          title="Camera access is off"
          body="Turn on camera access in Settings to photograph a document."
          stillWorks="You can still pick a photo from your files."
          state="denied"
          onAllow={() => undefined}
          onOpenSettings={() => undefined}
          onNotNow={() => undefined}
        />
      </GalleryItem>
    </GallerySection>
  );
}
