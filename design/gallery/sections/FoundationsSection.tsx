import React from 'react';
import { View } from 'react-native';
import {
  Divider,
  Icon,
  Logo,
  Spacer,
  Text,
  WaveHeader,
  medicineFormIcon,
} from '../../components/Foundations';
import type { IconProps } from '../../components/Foundations';
import { color, radius, space } from '../../tokens';
import type { TextTone } from '../../tokens';
import type { TextStyleName } from '../../typography';
import { GallerySection, GalleryItem } from '../GallerySection';

const TEXT_VARIANTS: TextStyleName[] = [
  'display',
  'title1',
  'title2',
  'title3',
  'body',
  'bodyStrong',
  'callout',
  'caption',
  'overline',
];

const TEXT_TONES: TextTone[] = ['primary', 'secondary', 'tertiary', 'link'];

const ICON_SIZES: NonNullable<IconProps['size']>[] = ['sm', 'md', 'lg'];

export function FoundationsSection() {
  return (
    <GallerySection title="Foundations" testID="gallery-foundations">
      {TEXT_VARIANTS.map((variant) => (
        <GalleryItem key={variant} label={variant}>
          <Text variant={variant}>Asha Rao, Paracetamol 500 mg</Text>
        </GalleryItem>
      ))}

      {TEXT_TONES.map((tone) => (
        <GalleryItem key={tone} label={`tone: ${tone}`}>
          <Text tone={tone}>Asha Rao, Paracetamol 500 mg</Text>
        </GalleryItem>
      ))}

      <GalleryItem label="Icon sizes">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          {ICON_SIZES.map((size) => (
            <View key={size} style={{ alignItems: 'center', gap: space.xs }}>
              <Icon name="medkit-outline" size={size} />
              <Text variant="caption" tone="secondary">
                {size}
              </Text>
            </View>
          ))}
        </View>
      </GalleryItem>

      <GalleryItem label="medicineFormIcon">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {Object.entries(medicineFormIcon).map(([form, icon]) => (
            <View key={form} style={{ width: 88, alignItems: 'center', gap: space.xs }}>
              <Icon name={icon} size="lg" />
              <Text variant="caption" tone="secondary">
                {form}
              </Text>
            </View>
          ))}
        </View>
      </GalleryItem>

      <GalleryItem label="Logo mark">
        <Logo variant="mark" />
      </GalleryItem>

      <GalleryItem label="Logo full">
        <Logo variant="full" />
      </GalleryItem>

      <GalleryItem label="Spacer and Divider">
        <View>
          <Text variant="body">Above the spacer</Text>
          <Spacer size="lg" />
          <Text variant="body">16 px below the spacer</Text>
          <Divider />
          <Spacer size="sm" />
          <Text variant="body">Below the divider</Text>
        </View>
      </GalleryItem>

      <GalleryItem label="WaveHeader, height 120">
        <View
          style={{
            borderWidth: 1,
            borderColor: color.border.subtle,
            borderRadius: radius.md,
            overflow: 'hidden',
          }}
        >
          <WaveHeader height={120}>
            <View style={{ padding: space.lg, gap: space.xs }}>
              <Text variant="title3">Asha Rao</Text>
              <Text variant="caption" tone="secondary">
                Header content sits above the wave
              </Text>
            </View>
          </WaveHeader>
        </View>
      </GalleryItem>

      <GalleryItem label="Screen and RefreshScroll">
        <Text variant="caption" tone="secondary">
          Screen and RefreshScroll are not rendered here. The gallery page itself is a Screen, so
          it demonstrates both.
        </Text>
      </GalleryItem>
    </GallerySection>
  );
}
