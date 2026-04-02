import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCartStore } from '../src/context/cartStore';
import { useColors } from '../src/hooks/useColors';
import type { ColorPalette } from '../src/theme/colors';
import { PaymentMethod } from '../src/interfaces';

export default function CheckoutModal() {
  const router = useRouter();
  const { items, getTotal, clearCart, paymentMethod, setPaymentMethod } = useCartStore();
  const [cashReceived, setCashReceived] = useState('');

  const total = getTotal();
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - total;
  const colors = useColors();
  const styles = makeStyles(colors);

  const paymentMethods: { id: PaymentMethod; label: string; icon: string; color: string }[] = [
    { id: 'efectivo', label: 'Efectivo', icon: 'cash', color: colors.neonGreen },
    { id: 'tarjeta', label: 'Tarjeta', icon: 'card', color: colors.neonCyan },
    { id: 'transferencia', label: 'Transfer', icon: 'phone-portrait', color: colors.neonMagenta },
  ];

  const handleConfirmPayment = () => {
    if (paymentMethod === 'efectivo' && cashAmount < total) {
      Alert.alert('Efectivo insuficiente', 'El monto recibido es menor al total');
      return;
    }

    // Success!
    Alert.alert(
      '¡Compra Exitosa!',
      `Total: $${total.toFixed(2)}\nMétodo: ${paymentMethods.find(p => p.id === paymentMethod)?.label}${paymentMethod === 'efectivo' ? `\nCambio: $${change.toFixed(2)}` : ''}\n\n¡Gracias por tu compra!`,
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmar Compra</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Carrito</Text>
          <View style={styles.orderSummary}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <Text style={styles.orderItemName}>{item.product.name}</Text>
                  <Text style={styles.orderItemMeta}>
                    {item.product.brand} • Talla {item.product.size}
                  </Text>
                </View>
                <Text style={styles.orderItemPrice}>
                  ${item.product.price.toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.orderDivider} />
            <View style={styles.orderTotal}>
              <Text style={styles.orderTotalLabel}>TOTAL</Text>
              <Text style={styles.orderTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <Pressable
                key={method.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === method.id && {
                    borderColor: method.color,
                    backgroundColor: method.color + '15',
                  },
                ]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <Ionicons
                  name={method.icon as any}
                  size={28}
                  color={paymentMethod === method.id ? method.color : colors.textMuted}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === method.id && { color: method.color },
                  ]}
                >
                  {method.label}
                </Text>
                {paymentMethod === method.id && (
                  <View style={[styles.checkmark, { backgroundColor: method.color }]}>
                    <Ionicons name="checkmark" size={14} color={colors.background} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Cash Input */}
        {paymentMethod === 'efectivo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Efectivo Recibido</Text>
            <View style={styles.cashInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.cashInput}
                value={cashReceived}
                onChangeText={setCashReceived}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {cashAmount >= total && (
              <View style={styles.changeContainer}>
                <Text style={styles.changeLabel}>Cambio:</Text>
                <Text style={styles.changeValue}>${change.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
          ]}
          onPress={handleConfirmPayment}
        >
          <Ionicons name="bag-check" size={28} color={colors.background} />
          <Text style={styles.confirmButtonText}>COMPRAR</Text>
          <Text style={styles.confirmButtonAmount}>${total.toFixed(2)}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: c.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: c.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  orderSummary: {
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    color: c.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  orderItemMeta: {
    color: c.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  orderItemPrice: {
    color: c.neonGreen,
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  orderDivider: {
    height: 1,
    backgroundColor: c.border,
    marginVertical: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    color: c.neonCyan,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  orderTotalValue: {
    color: c.neonGreen,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: c.border,
  },
  paymentLabel: {
    color: c.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: c.neonGreen + '50',
  },
  currencySymbol: {
    color: c.neonGreen,
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  cashInput: {
    flex: 1,
    color: c.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  changeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.neonGreen + '15',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  changeLabel: {
    color: c.textSecondary,
    fontSize: 16,
  },
  changeValue: {
    color: c.neonGreen,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.neonCyan,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 12,
  },
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    color: c.background,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  confirmButtonAmount: {
    color: c.background,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});;
