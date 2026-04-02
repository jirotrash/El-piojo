import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCategory, categoryIcons, categoryLabels } from '../interfaces';
import { categoryColors } from '../theme/colors';
import { useColors } from '../hooks/useColors';
import type { ColorPalette } from '../theme/colors';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'todos';
  onSelectCategory: (category: ProductCategory | 'todos') => void;
}

const categories: (ProductCategory | 'todos')[] = [
  'todos',
  'sudaderas',
  'playeras',
  'pantalones',
  'chamarras',
  'zapatos',
  'accesorios',
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const colors = useColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        const color = category === 'todos' ? colors.neonCyan : categoryColors[category];
        const icon = category === 'todos' ? 'grid' : categoryIcons[category];
        const label = category === 'todos' ? 'Todo' : categoryLabels[category];

        return (
          <Pressable
            key={category}
            style={({ pressed }) => [
              styles.chip,
              isSelected && { backgroundColor: color, borderColor: color },
              pressed && styles.chipPressed,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Ionicons
              name={icon as any}
              size={18}
              color={isSelected ? colors.background : color}
            />
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? colors.background : color },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
      </ScrollView>
    </View>
  );
};

const makeStyles = (c: ColorPalette) => StyleSheet.create({
  wrapper: {
    height: 64,
    flexShrink: 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    marginRight: 8,
    gap: 6,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
