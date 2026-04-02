import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, categoryIcons } from '../interfaces';
import { categoryColors } from '../theme/colors';
import { useColors } from '../hooks/useColors';
import type { ColorPalette } from '../theme/colors';

interface QuickAccessGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  products,
  onProductPress,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flash" size={20} color={colors.neonYellow} />
        <Text style={styles.title}>Acceso Rápido</Text>
      </View>
      <View style={styles.grid}>
        {products.map((product) => {
          const categoryColor = categoryColors[product.category] || colors.primary;
          const iconName = categoryIcons[product.category] || 'cube';

          return (
            <Pressable
              key={product.id}
              style={({ pressed }) => [
                styles.quickItem,
                { borderColor: categoryColor },
                pressed && styles.quickItemPressed,
              ]}
              onPress={() => onProductPress(product)}
            >
              <View style={[styles.iconBg, { backgroundColor: categoryColor + '20' }]}>
                <Ionicons name={iconName as any} size={24} color={categoryColor} />
              </View>
              <Text style={styles.quickItemName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[styles.quickItemPrice, { color: categoryColor }]}>
                ${product.price.toFixed(2)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    color: c.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickItem: {
    width: '31%',
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  quickItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickItemName: {
    color: c.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
