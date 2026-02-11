import { Ticket } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  onResale?: () => void;
}

export function TicketCard({ ticket, onPress, onResale }: TicketCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      valid: '#14F195',
      used: '#6b7280',
      listed: '#f59e0b',
      transferred: '#3b82f6',
      expired: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      general: { bg: '#374151', text: '#d1d5db' },
      vip: { bg: '#7c3aed20', text: '#a78bfa' },
      premium: { bg: '#f59e0b20', text: '#fbbf24' },
    };
    return badges[tier] || badges.general;
  };

  const tierBadge = getTierBadge(ticket.tier);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface-card rounded-2xl overflow-hidden mb-4 border border-gray-700/30"
      activeOpacity={0.8}
    >
      {/* Ticket Top Section - Dotted line separator style */}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-white font-bold text-base" numberOfLines={2}>
              {ticket.event.title}
            </Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1.5">
                {formatDate(ticket.event.date)} • {ticket.event.time}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={13} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1.5" numberOfLines={1}>
                {ticket.event.venue}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <View
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: getStatusColor(ticket.status) + '20' }}
            >
              <Text
                className="text-xs font-bold capitalize"
                style={{ color: getStatusColor(ticket.status) }}
              >
                {ticket.status}
              </Text>
            </View>
            <View
              className="px-2.5 py-1 rounded-full mt-1.5"
              style={{ backgroundColor: tierBadge.bg }}
            >
              <Text
                className="text-xs font-medium uppercase"
                style={{ color: tierBadge.text }}
              >
                {ticket.tier}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dotted Separator */}
      <View className="flex-row items-center px-2">
        <View className="w-4 h-8 bg-surface-dark rounded-r-full" />
        <View className="flex-1 border-t border-dashed border-gray-600" />
        <View className="w-4 h-8 bg-surface-dark rounded-l-full" />
      </View>

      {/* Ticket Bottom Section */}
      <View className="p-4 pt-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-500 text-xs">Purchased for</Text>
            <Text className="text-solana-green font-bold text-base">
              {ticket.purchasePrice} SOL
            </Text>
          </View>
          {ticket.seatInfo && (
            <View>
              <Text className="text-gray-500 text-xs">Seat</Text>
              <Text className="text-white font-medium text-sm">
                {ticket.seatInfo}
              </Text>
            </View>
          )}
          <View className="items-end">
            <Text className="text-gray-500 text-xs">Mint</Text>
            <Text className="text-gray-400 text-xs font-mono">
              {ticket.mintAddress.slice(0, 4)}...{ticket.mintAddress.slice(-4)}
            </Text>
          </View>
        </View>

        {ticket.status === 'valid' && onResale && (
          <View
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => onResale?.()}
          >
            <View
              className="mt-3 bg-solana-purple/20 border border-solana-purple/50 rounded-xl py-2.5 items-center"
            >
              <Text className="text-solana-purple font-semibold text-sm">
                List for Resale
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
