import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, ChipGroup, SearchField } from '../../design/components';
import { space } from '../../design/tokens';
import { t } from '../../design/strings';
import type { StringKey } from '../../design/strings';

// Option values for the "all" choices. They never reach the service: they map to undefined.
const ALL = 'ALL';

export const TIMELINE_CATEGORIES: { labelKey: StringKey; value: string | undefined }[] = [
  { labelKey: 'records.timeline.catAll', value: undefined },
  { labelKey: 'records.timeline.catPrescriptions', value: 'PRESCRIPTION' },
  { labelKey: 'records.timeline.catConsultations', value: 'CONSULTATION' },
  { labelKey: 'records.timeline.catInvestigations', value: 'INVESTIGATION' },
  { labelKey: 'records.timeline.catProcedures', value: 'PROCEDURE' },
];

export const TIMELINE_YEARS: (number | undefined)[] = [undefined, 2026, 2025, 2024, 2023];

export interface TimelineFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  selectedYear: number | undefined;
  onYearChange: (year: number | undefined) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

// Search, category and year filters. Behavior matches the former inline filter bars.
export function TimelineFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedYear,
  onYearChange,
  hasActiveFilters,
  onClearFilters,
}: TimelineFiltersProps) {
  const categoryOptions = TIMELINE_CATEGORIES.map((cat) => ({
    value: cat.value ?? ALL,
    label: t(cat.labelKey),
  }));
  const yearOptions = TIMELINE_YEARS.map((yr) => ({
    value: yr === undefined ? ALL : String(yr),
    label: yr === undefined ? t('records.timeline.allYears') : String(yr),
  }));

  return (
    <View style={styles.root}>
      <SearchField
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder={t('records.timeline.searchPlaceholder')}
        testID="timeline-search"
      />
      <ChipGroup
        testID="timeline-category"
        options={categoryOptions}
        selected={[selectedCategory ?? ALL]}
        onChange={(next) => {
          const first = next[0];
          onCategoryChange(first === undefined || first === ALL ? undefined : first);
        }}
      />
      <ChipGroup
        testID="timeline-year"
        options={yearOptions}
        selected={[selectedYear === undefined ? ALL : String(selectedYear)]}
        onChange={(next) => {
          const first = next[0];
          onYearChange(first === undefined || first === ALL ? undefined : Number(first));
        }}
      />
      {hasActiveFilters ? (
        <View style={styles.resetRow}>
          <Button
            label={t('records.timeline.resetFilters')}
            variant="text"
            onPress={onClearFilters}
            testID="timeline-reset"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
    marginBottom: space.sm,
  },
  resetRow: {
    alignItems: 'flex-start',
  },
});
