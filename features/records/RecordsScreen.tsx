import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SegmentedControl } from '../../design/components/Containers/SegmentedControl';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';
import { parseRecordsView } from '../shell/tabs';
import type { RecordsView } from '../shell/tabs';
import TimelineView from './TimelineView';
import ReportsView from './ReportsView';

// One tab for the timeline and the reports. The existing screens render unchanged below the switch.
export default function RecordsScreen() {
  const { view } = useLocalSearchParams<{ view?: string }>();
  const [selected, setSelected] = useState<RecordsView>(parseRecordsView(view));

  // A redirect or a link can change the requested segment while the tab is already mounted.
  useEffect(() => {
    setSelected(parseRecordsView(view));
  }, [view]);

  return (
    <View style={styles.root}>
      <View style={styles.switchRow}>
        <SegmentedControl<RecordsView>
          testID="records-view"
          options={[
            { value: 'timeline', label: t('records.timeline') },
            { value: 'reports', label: t('records.reports') },
          ]}
          value={selected}
          onChange={setSelected}
        />
      </View>
      <View style={styles.body}>{selected === 'reports' ? <ReportsView /> : <TimelineView />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg.screen },
  switchRow: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  body: { flex: 1 },
});
