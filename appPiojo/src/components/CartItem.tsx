import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../interfaces';
import { useColors } from '../hooks/useColors';
import type { ColorPalette } from '../theme/colors';

interface CartItemProps {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  const subtotal = item.product.price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.unitPrice}>
          ${item.product.price.toFixed(2)} c/u
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onDecrement}
        >
          <Ionicons name="remove" size={16} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.quantity}>{item.quantity}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            styles.quantityButtonAdd,
            pressed && styles.buttonPressed,
          ]}
          onPress={onIncrement}
        >
          <Ionicons name="add" size={16} color={colors.background} />
        </Pressable>
      </View>

      <Text style={styles.subtotal}>${subtotal.toFixed(2)}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.removeButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onRemove}
      >
        <Ionicons name="trash-outline" size={18} color={colors.error} />
      </Pressable>
    </View>
  );
};

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.border,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    color: c.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  unitPrice: {
    color: c.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: c.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonAdd: {
    backgroundColor: c.primary,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  quantity: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    minWidth: 32,
    textAlign: 'center',
  },
  subtotal: {
    color: c.mint,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    minWidth: 70,
    textAlign: 'right',
    marginRight: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: c.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
