import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-surface-dark items-center justify-center">
      <ActivityIndicator size="large" color="#9945FF" />
      <Text className="text-gray-400 mt-4 text-sm">{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-4xl mb-4">{icon ?? '📭'}</Text>
      <Text className="text-white font-bold text-lg text-center">{title}</Text>
      <Text className="text-gray-400 text-sm text-center mt-2">{message}</Text>
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
