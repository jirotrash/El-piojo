import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '../../src/components/ProductCard';
import { CategoryFilter } from '../../src/components/CategoryFilter';
import { SearchBar } from '../../src/components/SearchBar';
import { useCartStore } from '../../src/context/cartStore';
import { useAuthStore } from '../../src/context/authStore';
import { useProductStore } from '../../src/context/productStore';
import { useColors } from '../../src/hooks/useColors';
import type { ColorPalette } from '../../src/theme/colors';
import { Product, ProductCategory } from '../../src/interfaces';
import { getPublicaciones } from '../../src/services/publicacionesService';
import { useRouter, useFocusEffect } from 'expo-router';

export default function ShopScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colors = useColors();
  const styles = makeStyles(colors);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'todos'>('todos');
  const addItem = useCartStore((state) => state.addItem);
  const setSelectedProduct = useProductStore((s) => s.setSelected);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoadingCatalog(true);
      setCatalogError(null);
      getPublicaciones()
        .then((data) => { if (active) setProducts(data); })
        .catch((err) => { if (active) setCatalogError(err?.message ?? 'Error al cargar'); })
        .finally(() => { if (active) setLoadingCatalog(false); });
      return () => { active = false; };
    }, []),
  );

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    router.push(`/producto/${product.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Ionicons name="shirt" size={24} color={colors.secondary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>PIOJO</Text>
            <Text style={styles.headerSubtitle}>Ropa de Segunda Mano</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.welcomeText}>Hola, {user?.name?.split(' ')[0]}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Products Section */}
        <View style={styles.productsSection}>
          {/* Search Bar */}
          <SearchBar 
            value={searchQuery} 
            onChangeText={setSearchQuery}
            placeholder="Buscar ropa, marca, talla..."
          />

          {/* Category Filter */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Products List */}
          <ScrollView
            style={styles.productsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsContent}
          >
            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Ionicons name="shirt" size={18} color={colors.secondary} />
              <Text style={styles.sectionTitle}>Disponible para Ti</Text>
              <Text style={styles.productCount}>
                {loadingCatalog ? '...' : `${filteredProducts.length} prendas`}
              </Text>
            </View>

            {/* Product Cards */}
            {loadingCatalog ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.emptyText}>Cargando catálogo...</Text>
              </View>
            ) : catalogError ? (
              <View style={styles.emptyState}>
                <Ionicons name="cloud-offline-outline" size={52} color={colors.error ?? '#f87171'} />
                <Text style={[styles.emptyText, { color: colors.error ?? '#f87171' }]}>Error al cargar</Text>
                <Text style={styles.emptySubtext}>{catalogError}</Text>
              </View>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={handleProductPress}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                  <Ionicons name="shirt-outline" size={52} color={colors.primary} />
                </View>
                <Text style={styles.emptyText}>
                  {searchQuery || selectedCategory !== 'todos'
                    ? 'Sin resultados'
                    : 'Catálogo vacío'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || selectedCategory !== 'todos'
                    ? 'Intenta con otra búsqueda o categoría'
                    : 'Aún no hay prendas publicadas'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: c.card,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: c.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.secondary + '30',
  },
  headerTitle: {
    color: c.secondary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
  },
  headerSubtitle: {
    color: c.textMuted,
    fontSize: 11,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    color: c.textSecondary,
    fontSize: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.mint,
  },
  statusText: {
    color: c.mint,
    fontSize: 11,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  productsSection: {
    flex: 1,
  },
  productsList: {
    flex: 1,
  },
  productsContent: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: c.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  productCount: {
    color: c.textMuted,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 8,
  },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: c.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySubtext: {
    color: c.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: c.primary,
    alignSelf: 'center',
  },
  retryText: {
    color: c.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
