import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, categoryIcons, conditionColors } from '../interfaces';
import { categoryColors } from '../theme/colors';
import { useColors } from '../hooks/useColors';
import type { ColorPalette } from '../theme/colors';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const categoryColor = categoryColors[product.category] || colors.primary;
  const iconName = categoryIcons[product.category] || 'shirt';
  const conditionColor = conditionColors[product.condition || 'bueno'] || colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor: categoryColor },
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(product)}
    >
      {/* Imagen o icono de categoría */}
      <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <Ionicons name={iconName as any} size={32} color={categoryColor} />
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.size}>Talla: {product.size}</Text>
        </View>
        <View style={styles.conditionBadge}>
          <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
          <Text style={[styles.conditionText, { color: conditionColor }]}>
            {product.condition?.charAt(0).toUpperCase() + product.condition?.slice(1)}
          </Text>
        </View>
      </View>

      {/* Precio o Donación */}
      <View style={styles.priceContainer}>
        {product.price === 0 ? (
          <View style={styles.donationBadge}>
            <Ionicons name="heart" size={14} color={colors.neonMagenta} />
            <Text style={[styles.donationText, { color: colors.neonMagenta }]}>Donación</Text>
          </View>
        ) : (
          <Text style={styles.price}>${product.price.toFixed(0)}</Text>
        )}
        <View style={[styles.addButton, { backgroundColor: product.price === 0 ? colors.neonMagenta : colors.neonCyan }]}>
          <Ionicons name="add" size={20} color={colors.background} />
        </View>
      </View>
    </Pressable>
  );
};

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 90,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    color: c.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brand: {
    color: c.textSecondary,
    fontSize: 12,
  },
  separator: {
    color: c.textMuted,
    marginHorizontal: 6,
  },
  size: {
    color: c.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  price: {
    color: c.mint,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  donationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.neonMagenta + '20',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  donationText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: c.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
