import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@jfa/ui-tokens';
import type { IconName } from '../../src/components/ui';

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={typeof color === 'string' ? color : colors.textMuted} size={size} />;
  };

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy900 },
        headerTintColor: colors.textOnDark,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), headerTitle: t('appName'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="library" options={{ title: t('tabs.library'), tabBarIcon: icon('library') }} />
      <Tabs.Screen name="guides" options={{ title: t('tabs.guides'), tabBarIcon: icon('list') }} />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: icon('menu') }} />
    </Tabs>
  );
}
