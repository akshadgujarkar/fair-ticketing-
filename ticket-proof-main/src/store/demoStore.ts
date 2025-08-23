import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Event, Ticket, Listing, TicketTransaction, PurchaseLimit } from '../types';

interface DemoState {
  // Events
  events: Event[];
  tickets: Ticket[];
  listings: Listing[];
  purchaseLimits: PurchaseLimit[];
  
  // Actions
  addEvent: (event: Omit<Event, 'id'>) => string;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  purchaseTicket: (eventId: string, walletAddress: string, quantity: number) => Ticket[];
  listTicketForResale: (tokenId: string, price: number) => void;
  cancelListing: (listingId: string) => void;
  buyFromListing: (listingId: string, buyerAddress: string) => void;
  transferTicket: (tokenId: string, toAddress: string) => void;
  useTicket: (tokenId: string) => void;
  
  // Getters
  getEventById: (id: string) => Event | undefined;
  getTicketsByOwner: (owner: string) => Ticket[];
  getListingsByEvent: (eventId: string) => Listing[];
  getPurchaseLimit: (eventId: string, walletAddress: string) => PurchaseLimit | undefined;
}

// Sample data
const sampleEvents: Event[] = [
  {
    id: 'chainfest-2025',
    title: 'ChainFest Live 2025',
    coverImage: '/src/assets/chainfest-hero.jpg',
    venue: 'Madison Square Garden, New York',
    startsAt: new Date('2025-03-15T20:00:00Z'),
    endsAt: new Date('2025-03-15T23:00:00Z'),
    totalSupply: 500,
    soldCount: 347,
    basePrice: 0.02,
    royaltyPlatform: 10,
    royaltyArtist: 30,
    resalePriceCap: 20,
    perWalletLimit: 2,
    resaleLockedUntilSoldOut: true,
    status: 'live',
    organizerId: '0x1234...5678',
    description: 'The biggest Web3 festival of the year featuring top DJs, artists, and blockchain innovators. Experience the future of entertainment with NFT-powered tickets and exclusive digital collectibles.',
  },
  {
    id: 'crypto-conference',
    title: 'Ethereum Developers Conference',
    coverImage: '/src/assets/eth-conference.jpg',
    venue: 'Convention Center, Austin',
    startsAt: new Date('2025-04-20T09:00:00Z'),
    endsAt: new Date('2025-04-22T18:00:00Z'),
    totalSupply: 1000,
    soldCount: 1000,
    basePrice: 0.05,
    royaltyPlatform: 10,
    royaltyArtist: 30,
    resalePriceCap: 15,
    perWalletLimit: 3,
    resaleLockedUntilSoldOut: false,
    status: 'sold-out',
    organizerId: '0x1234...5678',
    description: 'Join leading Ethereum developers and researchers for three days of technical talks, workshops, and networking.',
  }
];

const generateTicketId = () => Math.floor(Math.random() * 10000).toString();
const generateTransactionHash = () => '0x' + Math.random().toString(16).substr(2, 64);

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      events: sampleEvents,
      tickets: [],
      listings: [],
      purchaseLimits: [],

      addEvent: (eventData) => {
        const id = Date.now().toString();
        const newEvent: Event = { ...eventData, id, soldCount: 0 };
        set((state) => ({ events: [...state.events, newEvent] }));
        return id;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      purchaseTicket: (eventId, walletAddress, quantity) => {
        const event = get().getEventById(eventId);
        if (!event) return [];

        const newTickets: Ticket[] = [];
        const transactions: TicketTransaction[] = [];

        for (let i = 0; i < quantity; i++) {
          const tokenId = generateTicketId();
          const transaction: TicketTransaction = {
            id: Date.now().toString() + i,
            type: 'mint',
            to: walletAddress,
            price: event.basePrice,
            txHash: generateTransactionHash(),
            timestamp: new Date(),
            blockNumber: Math.floor(Math.random() * 1000000),
          };

          const ticket: Ticket = {
            tokenId,
            eventId,
            owner: walletAddress,
            state: 'active',
            lastSalePrice: event.basePrice,
            resaleCount: 0,
            purchaseDate: new Date(),
            history: [transaction],
          };

          newTickets.push(ticket);
          transactions.push(transaction);
        }

        set((state) => {
          // Update purchase limits
          const existingLimit = state.purchaseLimits.find(
            (limit) => limit.eventId === eventId && limit.walletAddress === walletAddress
          );

          const updatedLimits = existingLimit
            ? state.purchaseLimits.map((limit) =>
                limit.eventId === eventId && limit.walletAddress === walletAddress
                  ? { ...limit, purchased: limit.purchased + quantity }
                  : limit
              )
            : [
                ...state.purchaseLimits,
                {
                  eventId,
                  walletAddress,
                  purchased: quantity,
                  limit: event.perWalletLimit,
                },
              ];

          return {
            tickets: [...state.tickets, ...newTickets],
            purchaseLimits: updatedLimits,
            events: state.events.map((e) =>
              e.id === eventId
                ? { 
                    ...e, 
                    soldCount: e.soldCount + quantity,
                    status: e.soldCount + quantity >= e.totalSupply ? 'sold-out' : e.status
                  }
                : e
            ),
          };
        });

        return newTickets;
      },

      listTicketForResale: (tokenId, price) => {
        const ticket = get().tickets.find((t) => t.tokenId === tokenId);
        if (!ticket || ticket.state !== 'active') return;

        const listing: Listing = {
          id: Date.now().toString(),
          tokenId,
          eventId: ticket.eventId,
          price,
          seller: ticket.owner,
          createdAt: new Date(),
          status: 'active',
        };

        set((state) => ({
          listings: [...state.listings, listing],
          tickets: state.tickets.map((t) =>
            t.tokenId === tokenId ? { ...t, state: 'listed' as const } : t
          ),
        }));
      },

      cancelListing: (listingId) => {
        const listing = get().listings.find((l) => l.id === listingId);
        if (!listing) return;

        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === listingId ? { ...l, status: 'cancelled' as const } : l
          ),
          tickets: state.tickets.map((t) =>
            t.tokenId === listing.tokenId ? { ...t, state: 'active' as const } : t
          ),
        }));
      },

      buyFromListing: (listingId, buyerAddress) => {
        const listing = get().listings.find((l) => l.id === listingId);
        if (!listing || listing.status !== 'active') return;

        const ticket = get().tickets.find((t) => t.tokenId === listing.tokenId);
        if (!ticket) return;

        const transaction: TicketTransaction = {
          id: Date.now().toString(),
          type: 'sale',
          from: listing.seller,
          to: buyerAddress,
          price: listing.price,
          txHash: generateTransactionHash(),
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
        };

        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === listingId ? { ...l, status: 'filled' as const } : l
          ),
          tickets: state.tickets.map((t) =>
            t.tokenId === listing.tokenId
              ? {
                  ...t,
                  owner: buyerAddress,
                  state: 'active' as const,
                  lastSalePrice: listing.price,
                  resaleCount: t.resaleCount + 1,
                  history: [...t.history, transaction],
                }
              : t
          ),
        }));
      },

      transferTicket: (tokenId, toAddress) => {
        const ticket = get().tickets.find((t) => t.tokenId === tokenId);
        if (!ticket || ticket.state !== 'active') return;

        const transaction: TicketTransaction = {
          id: Date.now().toString(),
          type: 'transfer',
          from: ticket.owner,
          to: toAddress,
          txHash: generateTransactionHash(),
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
        };

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.tokenId === tokenId
              ? {
                  ...t,
                  owner: toAddress,
                  history: [...t.history, transaction],
                }
              : t
          ),
        }));
      },

      useTicket: (tokenId) => {
        const ticket = get().tickets.find((t) => t.tokenId === tokenId);
        if (!ticket || ticket.state === 'used') return;

        const transaction: TicketTransaction = {
          id: Date.now().toString(),
          type: 'use',
          txHash: generateTransactionHash(),
          timestamp: new Date(),
          blockNumber: Math.floor(Math.random() * 1000000),
        };

        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.tokenId === tokenId
              ? {
                  ...t,
                  state: 'used' as const,
                  usedDate: new Date(),
                  history: [...t.history, transaction],
                }
              : t
          ),
        }));
      },

      // Getters
      getEventById: (id) => get().events.find((event) => event.id === id),
      
      getTicketsByOwner: (owner) =>
        get().tickets.filter((ticket) => ticket.owner === owner),
      
      getListingsByEvent: (eventId) =>
        get().listings.filter((listing) => listing.eventId === eventId && listing.status === 'active'),
      
      getPurchaseLimit: (eventId, walletAddress) =>
        get().purchaseLimits.find(
          (limit) => limit.eventId === eventId && limit.walletAddress === walletAddress
        ),
    }),
    {
      name: 'web3-ticketing-demo',
    }
  )
);