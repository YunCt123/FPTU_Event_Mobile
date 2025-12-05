import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, RADII, SHADOWS, SIZES } from '../../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

type TicketScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const MOCK_TICKETS = [
  {
    id: '1',
    title: 'Tech Talk: AI in Education',
    date: '15/12/2025',
    time: '14:00',
    location: 'Hall A',
    status: 'upcoming',
    icon: 'mic',
    ticketCode: 'TECH2025001',
  },
  {
    id: '2',
    title: 'Workshop: UI/UX Design',
    date: '18/12/2025',
    time: '09:00',
    location: 'Room 301',
    status: 'upcoming',
    icon: 'color-palette',
    ticketCode: 'DESIGN2025002',
  },
  {
    id: '3',
    title: 'Music Festival 2024',
    date: '10/11/2024',
    time: '18:00',
    location: 'Main Stage',
    status: 'used',
    icon: 'musical-notes',
    ticketCode: 'MUSIC2024003',
  },
];

const TicketScreen: React.FC<TicketScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'used'>('upcoming');

  const filteredTickets = MOCK_TICKETS.filter((ticket) => ticket.status === activeTab);

  return (
    <View style={styles.container}>
      <LinearGradient
            colors={COLORS.gradient_1}
            start={{x: 1, y: 0.2}} 
            end={{x: 0.2, y: 1}}
            style={styles.gradientBackground}
          >
      <View style={styles.header}>
        <Text style={styles.title}>Vé của tôi</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
              Sắp diễn ra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'used' && styles.tabActive]}
            onPress={() => setActiveTab('used')}
          >
            <Text style={[styles.tabText, activeTab === 'used' && styles.tabTextActive]}>
              Đã sử dụng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="ticket-outline" size={64} color={COLORS.text} style={{opacity: 0.3, marginBottom: SPACING.lg}} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Bạn chưa có vé nào' : 'Chưa có vé đã sử dụng'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('EventTab')}
              >
                <Text style={styles.browseButtonText}>Khám phá sự kiện</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.ticketsContainer}>
            {filteredTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketIconContainer}>
                    <Ionicons name={ticket.icon as any} size={24} color={COLORS.primary} />
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      ticket.status === 'used' && styles.statusBadgeUsed,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {ticket.status === 'upcoming' ? 'Sắp diễn ra' : 'Đã sử dụng'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketTitle}>{ticket.title}</Text>

                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetail}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                    <Text style={styles.detailText}>{ticket.date}</Text>
                  </View>
                  <View style={styles.ticketDetail}>
                    <Ionicons name="time-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                    <Text style={styles.detailText}>{ticket.time}</Text>
                  </View>
                </View>

                <View style={styles.ticketDetail}>
                  <Ionicons name="location-outline" size={14} color={COLORS.text} style={{opacity: 0.7}} />
                  <Text style={styles.detailText}>{ticket.location}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.ticketCodeContainer}>
                  <Text style={styles.ticketCodeLabel}>Mã vé</Text>
                  <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
                </View>

                {ticket.status === 'upcoming' && (
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONTS.header,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADII.button,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.huge * 2,
  },
  emptyText: {
    fontSize: FONTS.bodyLarge,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  ticketsContainer: {
    padding: SPACING.screenPadding,
    gap: SPACING.lg,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ticketIconContainer: {
    width: 50,
    height: 50,
    borderRadius: RADII.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.pill,
  },
  statusBadgeUsed: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: FONTS.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: FONTS.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  ticketDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  ticketDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: SPACING.md,
  },
  ticketCodeContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  ticketCodeLabel: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    opacity: 0.6,
    marginBottom: SPACING.xs,
  },
  ticketCode: {
    fontSize: FONTS.bodyLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.white,
    fontSize: FONTS.body,
    fontWeight: '600',
  },
});

export default TicketScreen;