/**
 * Professional Mobile Healthcare Components with Expo Vector Icons
 * Enhanced with Material Design and Better UX
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Color scheme matching the web app
const COLORS = {
  primary: '#667eea',
  success: '#198754',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#0dcaf0',
  light: '#f8f9fa',
  dark: '#333333',
  white: '#ffffff',
  gray: '#6c757d',
};

/**
 * Header Component with professional styling
 */
export function MobileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerTitle}>
          <MaterialCommunityIcons name="hospital-box" size={28} color={COLORS.primary} />
          <Text style={styles.headerText}>DigiHealth</Text>
        </View>
        <Pressable style={styles.headerIcon}>
          <MaterialCommunityIcons name="bell" size={24} color={COLORS.dark} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Dashboard Card Component
 */
export function MobileDashboardCard({
  title,
  value,
  icon,
  color = COLORS.primary,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: MaterialIconName;
  color?: string;
  subtitle?: string;
}) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBg, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );
}

/**
 * Action Button Component
 */
export function MobileActionButton({
  title,
  icon,
  onPress,
  color = COLORS.primary,
}: {
  title: string;
  icon: MaterialIconName;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={20} color={COLORS.white} />
      <Text style={styles.actionButtonText}>{title}</Text>
    </Pressable>
  );
}

/**
 * List Item Component
 */
export function MobileListItem({
  title,
  subtitle,
  icon,
  rightIcon,
  onPress,
  color = COLORS.primary,
}: {
  title: string;
  subtitle?: string;
  icon: MaterialIconName;
  rightIcon?: MaterialIconName;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.listItem, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.listIconBg, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle && <Text style={styles.listSubtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && (
        <MaterialCommunityIcons
          name={rightIcon}
          size={20}
          color={COLORS.gray}
        />
      )}
    </Pressable>
  );
}

/**
 * Badge Component
 */
export function MobileBadge({
  label,
  color = COLORS.primary,
}: {
  label: string;
  color?: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

/**
 * Alert Component
 */
export function MobileAlert({
  type = 'info',
  title,
  message,
  onClose,
}: {
  type?: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  onClose?: () => void;
}) {
  const colorMap = {
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
  };

  const iconMap: Record<'success' | 'warning' | 'danger' | 'info', MaterialIconName> = {
    success: 'check-circle',
    warning: 'alert-circle',
    danger: 'close-circle',
    info: 'information',
  };

  return (
    <View style={[styles.alert, { backgroundColor: colorMap[type] + '20', borderLeftColor: colorMap[type] }]}>
      <MaterialCommunityIcons
        name={iconMap[type]}
        size={24}
        color={colorMap[type]}
        style={styles.alertIcon}
      />
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: colorMap[type] }]}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
      {onClose && (
        <Pressable onPress={onClose}>
          <MaterialCommunityIcons name="close" size={20} color={colorMap[type]} />
        </Pressable>
      )}
    </View>
  );
}

/**
 * Tab Navigation Component
 */
export function MobileTabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Array<{ name: string; icon: MaterialIconName }>;
  activeTab: number;
  onTabChange: (index: number) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => (
        <Pressable
          key={index}
          style={[
            styles.tab,
            { borderBottomColor: activeTab === index ? COLORS.primary : 'transparent' },
            { borderBottomWidth: activeTab === index ? 2 : 0 },
          ]}
          onPress={() => onTabChange(index)}
        >
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={activeTab === index ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === index ? COLORS.primary : COLORS.gray },
            ]}
          >
            {tab.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerIcon: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  alertIcon: {
    marginRight: 12,
    marginLeft: 4,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: COLORS.gray,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default {
  MobileHeader,
  MobileDashboardCard,
  MobileActionButton,
  MobileListItem,
  MobileBadge,
  MobileAlert,
  MobileTabNavigation,
};
