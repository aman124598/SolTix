import { MarketplaceListing } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ListingCardProps {
  listing: MarketplaceListing;
  onPress: () => void;
  onBuy?: () => void;
  isOwner?: boolean;
}

export function ListingCard({ listing, onPress, onBuy, isOwner = false }: ListingCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const savings = typeof listing.maxAllowedPrice === 'number' && Number.isFinite(listing.maxAllowedPrice)
    ? listing.maxAllowedPrice - listing.listPrice
    : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface-card rounded-2xl overflow-hidden mb-4 border border-gray-700/30"
      activeOpacity={0.8}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {listing.ticket.event.title}
            </Text>
            <View className="flex-row items-center mt-1.5">
              <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">
                {formatDate(listing.ticket.event.date)}
              </Text>
              <Text className="text-gray-600 mx-1.5">•</Text>
              <Ionicons name="location-outline" size={12} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>
                {listing.ticket.event.location}
              </Text>
            </View>
          </View>
          {listing.ticket.tier !== 'general' && (
            <View className="bg-amber-500/20 px-2.5 py-1 rounded-full">
              <Text className="text-amber-400 text-xs font-bold uppercase">
                {listing.ticket.tier}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-end justify-between mt-4 pt-3 border-t border-gray-700/30">
          <View>
            <Text className="text-gray-500 text-xs">Resale Price</Text>
            <Text className="text-solana-green font-bold text-xl">
              {listing.listPrice} SOL
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-gray-500 text-xs">
                Original: {listing.ticket.purchasePrice} SOL
              </Text>
              {listing.royaltyPercentage > 0 && (
                <Text className="text-gray-500 text-xs ml-2">
                  • {listing.royaltyPercentage}% royalty
                </Text>
              )}
            </View>
          </View>

          {!isOwner && onBuy && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onBuy?.();
              }}
              className="bg-solana-purple px-5 py-2.5 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">Buy Now</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <View className="bg-amber-500/20 px-4 py-2.5 rounded-xl">
              <Text className="text-amber-400 font-semibold text-sm">Your Listing</Text>
            </View>
          )}
        </View>

        {savings > 0 && (
          <View className="flex-row items-center mt-2 bg-green-500/10 px-3 py-1.5 rounded-lg">
            <Ionicons name="shield-checkmark" size={14} color="#14F195" />
            <Text className="text-solana-green text-xs ml-1.5">
              {savings.toFixed(2)} SOL below max resale price
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
