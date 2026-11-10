import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors } from '@jfa/ui-tokens';
import { GlassTabBar } from '../../src/components/tab-bar';

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="learn" options={{ title: t('tabs.learn') }} />
      <Tabs.Screen name="ask" options={{ title: t('tabs.ask') }} />
      <Tabs.Screen name="docs" options={{ title: t('tabs.docs') }} />
      <Tabs.Screen name="me" options={{ title: t('tabs.me') }} />
    </Tabs>
  );
}
