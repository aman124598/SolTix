import {
  fetchAllEvents,
  fetchEventById as fetchEventByIdAPI
} from '@/services/event-service';
import { MOCK_EVENTS } from '@/data/mock-data';
import { EventCategory, EventData } from '@/types';
import { create } from 'zustand';

interface EventStore {
  events: EventData[];
  filteredEvents: EventData[];
  selectedCategory: EventCategory | 'all';
  searchQuery: string;
  loading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  setCategory: (category: EventCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  getEventById: (id: string) => EventData | undefined;
  fetchEventDetail: (id: string) => Promise<EventData | null>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  filteredEvents: [],
  selectedCategory: 'all',
  searchQuery: '',
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      let events = await fetchAllEvents();

      // Fall back to mock events if the database is empty (for testing)
      if (events.length === 0) {
        console.log('No events in database — using mock events for testing');
        events = MOCK_EVENTS;
      }

      const { selectedCategory, searchQuery } = get();

      let filtered = events;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((e) => e.category === selectedCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q)
        );
      }

      set({ events, filteredEvents: filtered, loading: false });
    } catch (error: any) {
      console.error('Error fetching events:', error);
      // Fall back to mock events on error so the user can still test
      console.log('Supabase unavailable — using mock events for testing');
      const { selectedCategory, searchQuery } = get();
      let filtered: EventData[] = MOCK_EVENTS;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((e) => e.category === selectedCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.location.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q)
        );
      }
      set({ events: MOCK_EVENTS, filteredEvents: filtered, loading: false, error: null });
    }
  },

  setCategory: (category: EventCategory | 'all') => {
    const { events, searchQuery } = get();
    let filtered = events;

    if (category !== 'all') {
      filtered = filtered.filter((e) => e.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.location.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
      );
    }

    set({ selectedCategory: category, filteredEvents: filtered });
  },

  setSearchQuery: (query: string) => {
    const { events, selectedCategory } = get();
    let filtered = events;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.location.toLowerCase().includes(lowerQuery) ||
          e.venue.toLowerCase().includes(lowerQuery)
      );
    }

    set({ searchQuery: query, filteredEvents: filtered });
  },

  getEventById: (id: string) => {
    const event = get().events.find((e) => e.id === id);
    // Fall back to mock data if not found in store
    return event ?? MOCK_EVENTS.find((e) => e.id === id);
  },

  fetchEventDetail: async (id: string) => {
    try {
      const event = await fetchEventByIdAPI(id);
      if (event) return event;
    } catch (error) {
      console.error('Error fetching event detail:', error);
    }
    // Fall back to mock data
    return MOCK_EVENTS.find((e) => e.id === id) ?? null;
  },
}));
