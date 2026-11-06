import { Redirect } from 'expo-router';
import { getSavedLocale } from '../src/lib/preferences';

/** First launch → pick a language; afterwards straight to Home. */
export default function Index() {
  return <Redirect href={getSavedLocale() ? '/(tabs)' : '/onboarding'} />;
}
