import {
  createTicket as createTicketAPI,
  fetchTicketsByOwner,
  updateTicketStatus as updateTicketStatusAPI,
} from '@/services/ticket-service';
import { MOCK_TICKETS } from '@/data/mock-data';
import { Ticket, TicketStatus, TicketTier } from '@/types';
import { create } from 'zustand';

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;

  fetchTickets: (walletAddress: string) => Promise<void>;
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByEvent: (eventId: string) => Ticket[];
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  addTicket: (params: {
    eventId: string;
    ownerWallet: string;
    purchasePrice: number;
    mintAddress: string;
    tokenAccount: string;
    metadataUri: string;
    tier: TicketTier;
    seatInfo?: string;
    txSignature: string;
  }) => Promise<Ticket>;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async (walletAddress: string) => {
    set({ loading: true, error: null });
    try {
      let tickets = await fetchTicketsByOwner(walletAddress);
      if (tickets.length === 0) {
        console.log('No tickets in database — using mock tickets for testing');
        tickets = MOCK_TICKETS;
      }
      set({ tickets, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load tickets';
      console.error('Error fetching tickets:', error);
      console.log('Supabase unavailable — using mock tickets for testing');
      set({ tickets: MOCK_TICKETS, loading: false, error: null });
    }
  },

  getTicketById: (id: string) => {
    return get().tickets.find((t) => t.id === id);
  },

  getTicketsByEvent: (eventId: string) => {
    return get().tickets.filter((t) => t.eventId === eventId);
  },

  updateTicketStatus: async (ticketId: string, status: TicketStatus) => {
    try {
      await updateTicketStatusAPI(ticketId, status);
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? { ...t, status } : t
        ),
      }));
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  addTicket: async (params) => {
    try {
      const ticket = await createTicketAPI(params);
      set((state) => ({
        tickets: [ticket, ...state.tickets],
      }));
      return ticket;
    } catch (error: any) {
      console.error('Error adding ticket:', error);
      throw error;
    }
  },
}));
