import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button } from '../../design/components/Actions/Button';
import { EmptyState } from '../../design/components/Feedback/EmptyState';
import { ErrorState } from '../../design/components/Feedback/ErrorState';
import { Text } from '../../design/components/Foundations/Text';
import { color, space } from '../../design/tokens';
import { t } from '../../design/strings';
import {
  TimelineEvent,
  timelineService,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';
import { TimelineDetailModal } from '../../features/timeline/TimelineDetailModal';
import { ReportExportModal } from '../../features/reports/ReportExportModal';
import { authService } from '../../services/auth/auth-service';
import { TimelineDateStrip } from './TimelineDateStrip';
import { TimelineEventRow } from './TimelineEventRow';
import { TimelineFilters } from './TimelineFilters';

const PAGE_SIZE = 20;

export default function TimelineView() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  // Detail Modal
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Report Export Modal
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);

  const fetchTimelineData = useCallback(
    async (isRefresh = false, isLoadMore = false) => {
      if (isLoadMore) {
        setLoadingMore(true);
      } else if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const offset = isLoadMore ? events.length : 0;
        const res = await timelineService.fetchTimeline({
          search: searchQuery.trim() || undefined,
          category: selectedCategory,
          year: selectedYear,
          limit: PAGE_SIZE,
          offset,
        });

        if (isLoadMore) {
          setEvents((prev) => [...prev, ...res.data]);
        } else {
          setEvents(res.data);
        }
        setTotalCount(res.pagination.totalCount);
      } catch (err: any) {
        setError(err?.message || t('records.timeline.loadFallback'));
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, selectedCategory, selectedYear, events.length]
  );

  useEffect(() => {
    fetchTimelineData();
  }, [searchQuery, selectedCategory, selectedYear]);

  useEffect(() => {
    const unsubscribe = authService.subscribe(() => {
      fetchTimelineData(true, false);
    });
    return unsubscribe;
  }, [fetchTimelineData]);

  const handleRefresh = () => {
    fetchTimelineData(true, false);
  };

  const handleLoadMore = () => {
    if (!loading && !loadingMore && events.length < totalCount) {
      fetchTimelineData(false, true);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setSelectedYear(undefined);
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory || selectedYear);

  const handleOpenDetail = (id: string) => {
    setSelectedEventId(id);
    setModalVisible(true);
  };

  const renderTimelineItem = ({ item, index }: { item: TimelineEvent; index: number }) => {
    const dateInfo = formatMedicalEventDate(
      item.eventDate,
      item.datePrecision,
      item.dateIsUncertain
    );

    // Show month/period header if first item or if period differs from previous item
    const prevItem = index > 0 ? events[index - 1] : null;
    const prevDateInfo = prevItem
      ? formatMedicalEventDate(prevItem.eventDate, prevItem.datePrecision, prevItem.dateIsUncertain)
      : null;

    const showPeriodHeader = !prevItem || prevDateInfo?.periodLabel !== dateInfo.periodLabel;

    return (
      <TimelineEventRow
        item={item}
        dateFormatted={dateInfo.formatted}
        periodLabel={showPeriodHeader ? dateInfo.periodLabel : null}
        onOpen={handleOpenDetail}
      />
    );
  };

  const renderBody = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={color.action.primary} />
          <Text variant="callout" tone="secondary" align="center" style={styles.stateText}>
            {t('records.timeline.loading')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <ErrorState
          title={t('records.timeline.errorTitle')}
          body={error}
          onRetry={() => fetchTimelineData()}
          testID="timeline-error"
        />
      );
    }

    if (events.length === 0) {
      if (hasActiveFilters) {
        return (
          <EmptyState
            icon="search"
            title={t('records.timeline.noMatchTitle')}
            body={t('records.timeline.noMatchBody')}
            action={{ label: t('records.timeline.clearFilters'), onPress: handleClearFilters }}
            testID="timeline-no-match"
          />
        );
      }
      return (
        <View>
          <EmptyState
            icon="medkit-outline"
            title={t('records.timeline.emptyTitle')}
            body={t('records.timeline.emptyBody')}
            testID="timeline-empty"
          />
          <Text variant="caption" tone="tertiary" align="center">
            {t('records.timeline.emptyNote')}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderTimelineItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={color.action.primary}
            colors={[color.action.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={color.action.primary} />
            </View>
          ) : events.length < totalCount ? (
            <View style={styles.loadMore}>
              <Button
                label={t('records.timeline.loadOlder', { count: totalCount - events.length })}
                variant="secondary"
                fullWidth
                onPress={handleLoadMore}
              />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Button
          label={t('records.timeline.sharePdf')}
          variant="secondary"
          icon="document-text-outline"
          onPress={() => setExportModalVisible(true)}
          testID="timeline-share"
        />
      </View>

      <TimelineDateStrip />

      <TimelineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <View style={styles.content}>{renderBody()}</View>

      {/* Event Detail Modal */}
      <TimelineDetailModal
        visible={modalVisible}
        eventId={selectedEventId}
        onClose={() => setModalVisible(false)}
      />

      {/* Report Export Modal */}
      <ReportExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.lg,
  },
  actionRow: {
    alignItems: 'flex-end',
    marginBottom: space.sm,
  },
  content: {
    flex: 1,
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
  },
  stateText: {
    marginTop: space.md,
  },
  listContent: {
    paddingTop: space.xs,
    paddingBottom: space.xxl,
  },
  loadingMore: {
    paddingVertical: space.md,
    alignItems: 'center',
  },
  loadMore: {
    marginTop: space.sm,
  },
});
