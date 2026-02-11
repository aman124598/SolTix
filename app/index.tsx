import { useWalletStore } from '@/store/wallet-store';
import { Redirect } from 'expo-router';

export default function RootIndex() {
  const { connected } = useWalletStore();

  if (connected) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/landing" />;
}
