import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { HorizontalDateStrip } from '../../components/HorizontalDateStrip';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/index';
import {
  TimelineEvent,
  timelineService,
  formatMedicalEventDate,
} from '../../services/timeline/timeline-service';
import { TimelineDetailModal } from '../../features/timeline/TimelineDetailModal';
import { ReportExportModal } from '../../features/reports/ReportExportModal';
import { authService } from '../../services/auth/auth-service';

const CATEGORIES = [
  { label: 'All Milestones', value: undefined },
  { label: 'Prescriptions 💊', value: 'PRESCRIPTION' },
  { label: 'Doctor Visits 🩺', value: 'CONSULTATION' },
  { label: 'Lab & Diagnostics 🧪', value: 'INVESTIGATION' },
  { label: 'Procedures ⚡', value: 'PROCEDURE' },
];

const COMMON_YEARS = [undefined, 2026, 2025, 2024, 2023];

const PAGE_SIZE = 20;

export default function TimelineScreen() {
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
        setError(err?.message || 'Failed to load timeline records. Please check your connection.');
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
      <View style={styles.eventItemWrapper}>
        {showPeriodHeader && (
          <View style={styles.periodHeader}>
            <View style={styles.periodDot} />
            <Text style={[typography.h3, styles.periodHeaderText]}>{dateInfo.periodLabel}</Text>
          </View>
        )}

        <View style={styles.cardWithLineRow}>
          {/* Vertical Timeline Track Line */}
          <View style={styles.timelineTrackContainer}>
            <View style={styles.timelineNode} />
            <View style={styles.timelineLine} />
          </View>

          {/* Event Content Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenDetail(item.id)}
            style={styles.cardTouchable}
          >
            <Card variant="elevated" style={styles.eventCard}>
              <View style={styles.eventCardHeader}>
                <View style={styles.badgeGroup}>
                  <Badge
                    label={item.eventType}
                    variant="info"
                    style={styles.categoryBadge}
                  />
                  {item.dateIsUncertain && (
                    <Badge label="Approximate Date" variant="warning" />
                  )}
                </View>
                <Text style={styles.eventDateText}>{dateInfo.formatted}</Text>
              </View>

              <Text style={[typography.h3, styles.eventTitle]} numberOfLines={2}>
                {item.title}
              </Text>

              <Text style={[typography.bodyMuted, styles.eventSummary]} numberOfLines={2}>
                {item.summary}
              </Text>

              <View style={styles.eventFooter}>
                <View style={styles.provenanceTag}>
                  <Text style={styles.provenanceTagText}>Confirmed Evidence Attached</Text>
                </View>
                <Text style={styles.viewDetailLink}>View Details ›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Screen Title */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={[typography.h1, { flex: 1, color: colors.textPrimary }]}>Health Timeline 📋</Text>
            <Button
              title="Share PDF"
              variant="outline"
              size="sm"
              onPress={() => setExportModalVisible(true)}
            />
          </View>
          <Text style={[typography.bodyMuted, styles.subHeader]}>
            Chronological record of prescriptions, doctor consultations, and lab results.
          </Text>
        </View>

        {/* Weekday Strip */}
        <HorizontalDateStrip />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search by medicine, doctor, clinic, or diagnosis..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category Filters (Horizontal Scroll) */}
        <View style={styles.filterBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.label}
                  onPress={() => setSelectedCategory(cat.value)}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                >
                  <Text
                    style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Year Filter Chips */}
        <View style={styles.filterBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {COMMON_YEARS.map((yr) => {
              const isSelected = selectedYear === yr;
              return (
                <TouchableOpacity
                  key={yr === undefined ? 'all-years' : String(yr)}
                  onPress={() => setSelectedYear(yr)}
                  style={[styles.yearChip, isSelected && styles.yearChipSelected]}
                >
                  <Text
                    style={[styles.yearChipText, isSelected && styles.yearChipTextSelected]}
                  >
                    {yr === undefined ? 'All Years' : String(yr)}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {hasActiveFilters && (
              <TouchableOpacity
                onPress={handleClearFilters}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterText}>Reset Filters ✕</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Main Content: Loading, Error, Empty, or Feed */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[typography.bodyMuted, styles.loadingText]}>
              Loading verified timeline records...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Card variant="muted" style={styles.errorCard}>
              <Text style={[typography.h3, styles.errorTitle]}>Unable to Load Timeline</Text>
              <Text style={[typography.bodyMuted, styles.errorText]}>{error}</Text>
              <Button
                title="Retry"
                variant="primary"
                onPress={() => fetchTimelineData()}
                style={styles.retryButton}
              />
            </Card>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.centerContainer}>
            {hasActiveFilters ? (
              <Card variant="muted" style={styles.emptyCard}>
                <Badge label="No Matches" variant="neutral" style={styles.emptyBadge} />
                <Text style={[typography.h3, styles.emptyTitle]}>No Records Match Filter</Text>
                <Text style={[typography.bodyMuted, styles.emptyText]}>
                  Try clearing your search term or selecting "All Categories" / "All Years".
                </Text>
                <Button
                  title="Clear All Filters"
                  variant="outline"
                  onPress={handleClearFilters}
                  style={styles.clearBtn}
                />
              </Card>
            ) : (
              <Card variant="muted" style={styles.emptyCard}>
                <Badge label="Timeline Empty" variant="neutral" style={styles.emptyBadge} />
                <Text style={[typography.h3, styles.emptyTitle]}>No Medical History Yet</Text>
                <Text style={[typography.bodyMuted, styles.emptyText]}>
                  When you upload prescriptions or health summaries and confirm them, your verified chronological medical events will appear here.
                </Text>
                <Text style={[typography.caption, styles.emptyDisclaimer]}>
                  Unreviewed AI drafts are never included without your explicit review and confirmation.
                </Text>
              </Card>
            )}
          </View>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderTimelineItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreBox}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : events.length < totalCount ? (
                <TouchableOpacity onPress={handleLoadMore} style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>
                    Load Older Records ({totalCount - events.length} remaining)
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}

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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subHeader: {
    marginTop: spacing.xs / 2,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    marginBottom: spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterBarContainer: {
    marginBottom: spacing.xs,
  },
  filterChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 2px 8px rgba(17, 20, 24, 0.02)',
        } as any)
      : {}),
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  yearChip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs / 2 + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  yearChipSelected: {
    backgroundColor: colors.accentCyan,
    borderColor: colors.accentCyan,
  },
  yearChipText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  yearChipTextSelected: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  clearFilterButton: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs / 2 + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: 'rgba(225, 29, 72, 0.2)',
  },
  clearFilterText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 110, // Ensure space for floating dock
    paddingTop: spacing.xs,
  },
  eventItemWrapper: {
    marginBottom: spacing.xs,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentCoral,
    marginRight: spacing.sm,
  },
  periodHeaderText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cardWithLineRow: {
    flexDirection: 'row',
  },
  timelineTrackContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentCoral,
    borderWidth: 2,
    borderColor: colors.surface,
    marginTop: 18,
    zIndex: 1,
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -12,
    width: 2,
    backgroundColor: colors.border,
  },
  cardTouchable: {
    flex: 1,
  },
  eventCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 4px 14px rgba(17, 20, 24, 0.03)',
        } as any)
      : shadows.sm),
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryBadge: {
    marginRight: spacing.xs,
  },
  eventDateText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accentCyan,
  },
  eventTitle: {
    marginBottom: 4,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  eventSummary: {
    marginBottom: spacing.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.xs + 2,
  },
  provenanceTag: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  provenanceTagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  viewDetailLink: {
    ...typography.caption,
    color: colors.accentCyan,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorCard: {
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  errorTitle: {
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  emptyBadge: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  emptyDisclaimer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  clearBtn: {
    marginTop: spacing.xs,
  },
  loadingMoreBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  loadMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
