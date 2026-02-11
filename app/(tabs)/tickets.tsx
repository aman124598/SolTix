import { TicketCard } from '@/components/ticket-card';
import { TransactionModal } from '@/components/transaction-modal';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingScreen } from '@/components/ui/loading';
import { useTicketStore } from '@/store/ticket-store';
import { useWalletStore } from '@/store/wallet-store';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyTicketsScreen() {
  const { tickets, loading, fetchTickets } = useTicketStore();
  const { connected, publicKey } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [txState, setTxState] = useState<'confirming' | 'processing' | 'success' | 'error'>('confirming');

  useEffect(() => {
    if (connected && publicKey) {
      fetchTickets(publicKey);
    }
  }, [connected, publicKey]);

  const onRefresh = async () => {
    if (!publicKey) return;
    setRefreshing(true);
    try {
      await fetchTickets(publicKey);
    } catch (error) {
      console.error('Error refreshing tickets:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResale = (ticketId: string) => {
    setTxModalVisible(false);
    router.push(`/resale/${ticketId}` as any);
  };

  if (!connected) {
    return (
      <SafeAreaView className="flex-1 bg-surface-dark">
        <EmptyState
          title="Wallet Not Connected"
          message="Connect your wallet to view your tickets"
          action={
            <Button
              title="Go to Dashboard"
              onPress={() => router.push('/(tabs)')}
              variant="primary"
            />
          }
        />
      </SafeAreaView>
    );
  }

  if (loading && tickets.length === 0) {
    return <LoadingScreen message="Loading your tickets..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-dark">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-white font-bold text-2xl">My Tickets</Text>
        <Text className="text-gray-400 text-sm mt-1">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in your wallet
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9945FF" />
        }
      >
        {tickets.length === 0 ? (
          <EmptyState
            title="No Tickets Yet"
            message="Browse events and purchase your first NFT ticket"
            action={
              <Button
                title="Explore Events"
                onPress={() => router.push('/(tabs)/explore')}
                variant="primary"
              />
            }
          />
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onPress={() => router.push(`/event/${ticket.eventId}` as any)}
              onResale={
                ticket.status === 'valid' ? () => handleResale(ticket.id) : undefined
              }
            />
          ))
        )}
      </ScrollView>

      <TransactionModal
        visible={txModalVisible}
        state={txState}
        title="Listing Ticket"
        onClose={() => {
          setTxModalVisible(false);
          setTxState('confirming');
        }}
      />
    </SafeAreaView>
  );
}
