import '../src/lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@jfa/ui-tokens';
import { ContentProvider } from '../src/content/content-context';
import { initAnalytics, initErrorTracking } from '../src/integrations';

initErrorTracking();
initAnalytics();

export default function RootLayout() {
  const { t } = useTranslation();
  return (
    <SafeAreaProvider>
      <ContentProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.navy900 },
            headerTintColor: colors.textOnDark,
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitle: t('back'),
            contentStyle: { backgroundColor: colors.surfaceMuted },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ContentProvider>
    </SafeAreaProvider>
  );
}
