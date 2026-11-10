import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Tabs } from 'expo-router';
import { colors, fonts, radius, spacing } from '@jfa/ui-tokens';
import type { IconName } from './ui';

/** Expo Router vendors React Navigation; derive the tab bar props from its `Tabs` component. */
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, [IconName, IconName]> = {
  index: ['home-outline', 'home'],
  learn: ['book-outline', 'book'],
  ask: ['sparkles-outline', 'sparkles'],
  docs: ['document-text-outline', 'document-text'],
  me: ['person-circle-outline', 'person-circle'],
};

/** Floating glass bottom navigation (5 items, icon + label, clear active state). */
export function GlassTabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.sm) + spacing.xs }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key]!;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={[styles.item, focused && styles.itemOn]}
            >
              <Ionicons name={focused ? filled : outline} size={22} color={focused ? colors.accentText : colors.textSubtle} />
              <Text style={[styles.label, { color: focused ? colors.text : colors.textSubtle }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    padding: spacing.xs + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.navBar,
    borderWidth: 1,
    borderColor: colors.line,
    boxShadow: '0 -8px 24px -12px rgba(0,0,0,0.6)',
  },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: radius.lg },
  itemOn: { backgroundColor: 'rgba(255,255,255,0.08)' },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13 },
});
