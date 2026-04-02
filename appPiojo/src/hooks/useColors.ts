import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorPalette } from '../theme/colors';
import { useThemeStore } from '../context/themeStore';

export const useColors = (): ColorPalette => {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && systemScheme === 'dark');

  return isDark ? darkColors : lightColors;
};

/** Devuelve 'dark' | 'light' resuelto (útil para StatusBar) */
export const useResolvedScheme = (): 'dark' | 'light' => {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return systemScheme === 'dark' ? 'dark' : 'light';
};
