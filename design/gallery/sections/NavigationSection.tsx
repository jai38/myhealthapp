import React, { useState } from 'react';
import { View } from 'react-native';
import { GalleryItem, GallerySection } from '../GallerySection';
import {
  FilterBar,
  NotificationBell,
  PatientBanner,
  PatientPill,
  TabBar,
  TopBar,
} from '../../components/Navigation';
import type { TabKey } from '../../components/Navigation';
import { Button } from '../../components/Actions';
import { color, radius, space } from '../../tokens';

const INITIAL_FILTERS = [
  { key: 'medicine', label: 'Metformin 500 mg' },
  { key: 'period', label: 'This week' },
];

export function NavigationSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  return (
    <GallerySection title="Navigation" testID="gallery-navigation">
      <GalleryItem label="TabBar: interactive">
        {/* TabBar is not absolutely positioned in its own style, so it sits in flow inside this fixed box. */}
        <View
          style={{
            height: 100,
            position: 'relative',
            borderWidth: 1,
            borderColor: color.border.subtle,
            borderRadius: radius.md,
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
        >
          <TabBar active={activeTab} onSelect={setActiveTab} />
        </View>
      </GalleryItem>

      <GalleryItem label="TopBar: title only">
        <TopBar title="Medicines" />
      </GalleryItem>

      <GalleryItem label="TopBar: with back">
        <TopBar title="Paracetamol 500 mg" onBack={() => undefined} />
      </GalleryItem>

      <GalleryItem label="TopBar: with right NotificationBell">
        <TopBar
          title="Today"
          right={<NotificationBell count={3} onPress={() => undefined} />}
        />
      </GalleryItem>

      <GalleryItem label="PatientPill: pressable">
        <PatientPill name="Asha Rao" onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="PatientPill: static">
        <PatientPill name="Ravi Rao" />
      </GalleryItem>

      <GalleryItem label="PatientPill: long name (truncates)">
        <PatientPill name="Asha Ramachandran Venkataraman" onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="NotificationBell: 0">
        <NotificationBell count={0} onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="NotificationBell: 3">
        <NotificationBell count={3} onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="NotificationBell: 12">
        <NotificationBell count={12} onPress={() => undefined} />
      </GalleryItem>

      <GalleryItem label="PatientBanner">
        <PatientBanner name="Ravi Rao" />
      </GalleryItem>

      <GalleryItem label="FilterBar: none active">
        <FilterBar filters={[]} onRemove={() => undefined} onClearAll={() => undefined} />
      </GalleryItem>

      <GalleryItem label="FilterBar: 2 active (interactive)">
        <View style={{ gap: space.sm }}>
          <FilterBar
            filters={filters}
            onRemove={(key) => setFilters((current) => current.filter((f) => f.key !== key))}
            onClearAll={() => setFilters([])}
          />
          <Button
            label="Reset filters"
            variant="text"
            onPress={() => setFilters(INITIAL_FILTERS)}
          />
        </View>
      </GalleryItem>
    </GallerySection>
  );
}
