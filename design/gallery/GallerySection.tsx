import React from 'react';
import { View } from 'react-native';
import { space } from '../tokens';
import { Text } from '../components/Foundations/Text';
import { Divider } from '../components/Foundations/Divider';
import { ErrorState } from '../components/Feedback/ErrorState';

export interface GallerySectionProps {
  title: string;
  children: React.ReactNode;
  testID?: string;
}

interface BoundaryState {
  failed: boolean;
}

// One broken section shows ErrorState; the rest of the gallery still renders.
class SectionBoundary extends React.Component<{ children: React.ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <ErrorState onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}

export function GallerySection({ title, children, testID }: GallerySectionProps) {
  return (
    <View testID={testID} style={{ paddingVertical: space.xl, gap: space.lg }}>
      <Text variant="title1">{title}</Text>
      <SectionBoundary>{children}</SectionBoundary>
      <Divider />
    </View>
  );
}

// A labelled example inside a section, e.g. "Disabled".
export function GalleryItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="overline" tone="secondary">
        {label}
      </Text>
      {children}
    </View>
  );
}
