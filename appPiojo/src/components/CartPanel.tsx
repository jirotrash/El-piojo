import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../context/cartStore';
import { CartItemComponent } from './CartItem';
import { useColors } from '../hooks/useColors';
import type { ColorPalette } from '../theme/colors';

interface CartPanelProps {
  onCheckout: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ onCheckout }) => {
  const colors = useColors();
  const {
    items,
    getSubtotal,
    getTotal,
    getItemCount,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const subtotal = getSubtotal();
  const total = getTotal();
  const itemCount = getItemCount();

  const styles = makeStyles(colors);

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar Carrito',
      '¿Estás seguro de que quieres vaciar el carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Vaciar', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Carrito Vacío', 'Agrega productos para continuar');
      return;
    }
    onCheckout();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="cart" size={24} color={colors.neonCyan} />
          <Text style={styles.headerTitle}>Carrito</Text>
          {itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
        {items.length > 0 && (
          <Pressable onPress={handleClearCart} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </Pressable>
        )}
      </View>

      {/* Cart Items */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Carrito vacío</Text>
            <Text style={styles.emptySubtext}>Agrega productos para comenzar</Text>
          </View>
        ) : (
          items.map((item) => (
            <CartItemComponent
              key={item.product.id}
              item={item}
              onIncrement={() => updateQuantity(item.product.id, item.quantity + 1)}
              onDecrement={() => updateQuantity(item.product.id, item.quantity - 1)}
              onRemove={() => removeItem(item.product.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.totalRow}>
          <Text style={styles.grandTotalLabel}>TOTAL</Text>
          <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <Pressable
        style={({ pressed }) => [
          styles.checkoutButton,
          items.length === 0 && styles.checkoutButtonDisabled,
          pressed && styles.checkoutButtonPressed,
        ]}
        onPress={handleCheckout}
        disabled={items.length === 0}
      >
        <Ionicons name="card" size={24} color={colors.background} />
        <Text style={styles.checkoutButtonText}>COBRAR</Text>
        <Text style={styles.checkoutAmount}>${total.toFixed(2)}</Text>
      </Pressable>
    </View>
  );
};

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: c.primary + '30',
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: c.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: c.secondary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  clearButton: {
    padding: 8,
  },
  itemsContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: c.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    color: c.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  totalsContainer: {
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: c.textSecondary,
    fontSize: 14,
  },
  subtotalValue: {
    color: c.textPrimary,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 12,
  },
  grandTotalLabel: {
    color: c.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  grandTotalValue: {
    color: c.mint,
    fontSize: 28,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 16,
    gap: 12,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonDisabled: {
    backgroundColor: c.border,
    shadowOpacity: 0,
  },
  checkoutButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  checkoutAmount: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
