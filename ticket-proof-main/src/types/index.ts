export interface Event {
  id: string;
  title: string;
  coverImage: string;
  venue: string;
  startsAt: Date;
  endsAt: Date;
  totalSupply: number;
  soldCount: number;
  basePrice: number; // in ETH
  royaltyPlatform: number; // percentage
  royaltyArtist: number; // percentage
  resalePriceCap: number; // max % above last sale
  perWalletLimit: number;
  resaleLockedUntilSoldOut: boolean;
  contractAddress?: string;
  chainId?: number;
  status: 'upcoming' | 'live' | 'ended' | 'sold-out';
  organizerId: string;
  description: string;
}

export interface Ticket {
  tokenId: string;
  eventId: string;
  owner: string;
  state: 'active' | 'listed' | 'used';
  lastSalePrice: number;
  resaleCount: number;
  purchaseDate: Date;
  usedDate?: Date;
  history: TicketTransaction[];
}

export interface Listing {
  id: string;
  tokenId: string;
  eventId: string;
  price: number;
  seller: string;
  createdAt: Date;
  status: 'active' | 'filled' | 'cancelled';
}

export interface TicketTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'list' | 'sale' | 'cancel' | 'use';
  from?: string;
  to?: string;
  price?: number;
  txHash?: string;
  timestamp: Date;
  blockNumber?: number;
}

export interface User {
  address: string;
  isConnected: boolean;
  chainId?: number;
  ownedTickets: Ticket[];
  listedTickets: Listing[];
}

export interface RoyaltyBreakdown {
  sellerProceeds: number;
  platformFee: number;
  artistRoyalty: number;
  total: number;
}

export interface PurchaseLimit {
  eventId: string;
  walletAddress: string;
  purchased: number;
  limit: number;
}


export type EventFormData = {
  title: string;
  venue: string;
  description: string;
  startsAt: Date | string; // depending on your usage, could be Date or ISO string
  Time: string;
  totalSupply: number;
  soldCount: number;
  contractAddress?: string,
  basePrice: number;
  perWalletLimit: number;
  royaltyPlatform: number;
  royaltyArtist: number;
  resalePriceCap: number;
  resaleLockedUntilSoldOut: boolean;
  coverImage: string;
  status: 'live' | 'upcoming' | 'sold-out' | 'ended';
  organizerId: string; // address type as string
};
