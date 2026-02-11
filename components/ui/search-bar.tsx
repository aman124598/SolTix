import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search events...',
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface-card rounded-xl px-4 py-3 mb-4">
      <Ionicons name="search" size={18} color="#6b7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        className="flex-1 text-white ml-2.5 text-sm"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={18}
          color="#6b7280"
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}

interface CategoryFilterProps {
  categories: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4">
      {categories.map((cat) => (
        <View key={cat.key}>
          <Text
            onPress={() => onSelect(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${selected === cat.key
                ? 'bg-solana-purple text-white'
                : 'bg-surface-card text-gray-400'
              }`}
          >
            {cat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
