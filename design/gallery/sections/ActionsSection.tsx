import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, IconButton, LinkRow, PasskeyButton, UndoToast } from '../../components/Actions';
import type { ButtonVariant } from '../../components/Actions';
import { space } from '../../tokens';
import { GallerySection, GalleryItem } from '../GallerySection';

const BUTTON_VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'text', 'danger'];

const noop = (): void => {};

export function ActionsSection() {
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <GallerySection title="Actions" testID="gallery-actions">
      {BUTTON_VARIANTS.map((variant) => (
        <GalleryItem key={variant} label={`Button ${variant}`}>
          <View style={{ gap: space.sm }}>
            <Button label="Default" variant={variant} onPress={noop} />
            <Button label="Disabled" variant={variant} disabled onPress={noop} />
            <Button label="Loading" variant={variant} loading onPress={noop} />
          </View>
        </GalleryItem>
      ))}

      <GalleryItem label="Button with icon">
        <Button label="Add medicine" variant="primary" icon="add" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="Button with a long label in a 200 px box">
        <View style={{ width: 200 }}>
          <Button
            label="Save this reading and add a note for your doctor"
            variant="secondary"
            onPress={noop}
          />
        </View>
      </GalleryItem>

      <GalleryItem label="IconButton default">
        <IconButton icon="close" accessibilityLabel="Close" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="IconButton disabled">
        <IconButton icon="close" accessibilityLabel="Close" onPress={noop} disabled />
      </GalleryItem>

      <GalleryItem label="PasskeyButton">
        <View style={{ gap: space.sm }}>
          <PasskeyButton onPress={noop} />
          <PasskeyButton onPress={noop} disabled />
        </View>
      </GalleryItem>

      <GalleryItem label="LinkRow with icon and value">
        <LinkRow label="Medicines" icon="medkit-outline" value="3 active" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="LinkRow with icon, no value">
        <LinkRow label="Profile" icon="person-circle-outline" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="LinkRow with value, no icon">
        <LinkRow label="Doctor" value="Not added yet" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="LinkRow label only">
        <LinkRow label="Privacy" onPress={noop} />
      </GalleryItem>

      <GalleryItem label="UndoToast">
        <View style={{ minHeight: 120, gap: space.sm }}>
          <Button
            label="Show undo toast"
            variant="secondary"
            onPress={() => setToastVisible((v) => !v)}
          />
          <UndoToast
            message="Paracetamol 500 mg removed"
            visible={toastVisible}
            onUndo={() => setToastVisible(false)}
            onDismiss={() => setToastVisible(false)}
          />
        </View>
      </GalleryItem>
    </GallerySection>
  );
}
