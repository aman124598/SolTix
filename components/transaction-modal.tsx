import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

type TransactionState = 'confirming' | 'processing' | 'success' | 'error';

interface TransactionModalProps {
  visible: boolean;
  state: TransactionState;
  title: string;
  message?: string;
  signature?: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function TransactionModal({
  visible,
  state,
  title,
  message,
  signature,
  onClose,
  onRetry,
}: TransactionModalProps) {
  const stateConfig = {
    confirming: {
      icon: null,
      color: '#9945FF',
      subtitle: 'Please approve the transaction in your wallet',
    },
    processing: {
      icon: null,
      color: '#f59e0b',
      subtitle: 'Transaction is being confirmed on Solana...',
    },
    success: {
      icon: 'checkmark-circle' as const,
      color: '#14F195',
      subtitle: message || 'Transaction confirmed successfully!',
    },
    error: {
      icon: 'close-circle' as const,
      color: '#ef4444',
      subtitle: message || 'Transaction failed. Please try again.',
    },
  };

  const config = stateConfig[state];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-surface-dark rounded-3xl p-8 w-full max-w-md items-center border border-gray-700/50">
          {(state === 'confirming' || state === 'processing') && (
            <View className="mb-2">
              <View className="w-20 h-20 rounded-full bg-gray-800/60 items-center justify-center border border-gray-600/40">
                <ActivityIndicator size="large" color={config.color} />
              </View>
            </View>
          )}

          {state === 'success' && (
            <View className="mb-2">
              <View className="w-20 h-20 rounded-full bg-solana-green/20 items-center justify-center border-2 border-solana-green/60">
                <Ionicons name="checkmark-circle" size={56} color="#14F195" />
              </View>
            </View>
          )}

          {state === 'error' && (
            <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center border-2 border-red-500/60 mb-2">
              <Ionicons name="close-circle" size={56} color="#ef4444" />
            </View>
          )}

          <Text className="text-white font-bold text-xl mt-5 text-center tracking-tight">{title}</Text>
          <Text className="text-gray-400 text-sm mt-2.5 text-center leading-5 px-2">{config.subtitle}</Text>

          {signature && state === 'success' && (
            <View className="bg-surface-dark/80 rounded-2xl px-5 py-3.5 mt-5 w-full border border-gray-700/40">
              <Text className="text-solana-green text-xs font-semibold mb-1.5">Transaction Signature</Text>
              <Text className="text-gray-300 text-xs font-mono leading-4">
                {signature.slice(0, 22)}...{signature.slice(-12)}
              </Text>
            </View>
          )}

          <View className="flex-row mt-7 gap-3 w-full">
            {state === 'error' && onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                className="flex-1 bg-solana-purple rounded-2xl py-4 items-center border border-solana-purple/50"
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Retry transaction"
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons name="refresh" size={18} color="#ffffff" />
                  <Text className="text-white font-bold text-base">Retry</Text>
                </View>
              </TouchableOpacity>
            )}

            {(state === 'success' || state === 'error') && (
              <TouchableOpacity
                onPress={onClose}
                className={`flex-1 rounded-2xl py-4 items-center ${
                  state === 'success'
                    ? 'bg-solana-green border border-solana-green/50'
                    : 'bg-surface-card border border-gray-600/50'
                }`}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={state === 'success' ? 'Done' : 'Close modal'}
              >
                <View className="flex-row items-center gap-2">
                  {state === 'success' && <Ionicons name="checkmark" size={20} color="#1a1a2e" />}
                  <Text 
                    className={`font-bold text-base ${
                      state === 'success' ? 'text-surface-dark' : 'text-white'
                    }`}
                  >
                    {state === 'success' ? 'Done' : 'Close'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
