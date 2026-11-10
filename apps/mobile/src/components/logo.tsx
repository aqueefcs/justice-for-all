import { Image, StyleSheet } from 'react-native';
import { colors } from '@jfa/ui-tokens';

const SOURCE = require('../../assets/images/logo.png');

/** The "Open Law" app mark (book + balance + point of light). Decorative next to the app name. */
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <Image
      source={SOURCE}
      accessibilityIgnoresInvertColors
      accessible={false}
      style={[styles.logo, { width: size, height: size, borderRadius: size * 0.226 }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: { boxShadow: `0 8px 24px -8px ${colors.accentGlow}` },
});
