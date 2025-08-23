import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/store/demoStore";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";
import { Ticket as TicketType } from "@/types";
import {
  Ticket,
  Wallet,
  TrendingUp,
  QrCode,
  Send,
  DollarSign,
  ExternalLink,
  History
} from "lucide-react";
import QRCode from 'qrcode';
import { ethers } from "ethers";


const Dashboard = () => {
  // const { address, isConnected } = useWallet();
  const [connected, isConnected] = useState(false);
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("");
  const { getTicketsByOwner, getEventById, transferTicket, listTicketForResale } = useDemoStore();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const userTickets = address ? getTicketsByOwner(address) : [];
  const activeTickets = userTickets.filter(ticket => ticket.state === 'active');
  const listedTickets = userTickets.filter(ticket => ticket.state === 'listed');
  const usedTickets = userTickets.filter(ticket => ticket.state === 'used');

   async function getBalalnce() {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      const balanceWei = await provider.getBalance(walletAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth)
    }



  useEffect(() => {
    if (localStorage.getItem("address")) {
      isConnected(true);
      setAddress(localStorage.getItem("address"))
      return;
    }
   
  },[])
  
  getBalalnce();

  const totalValue = userTickets.reduce((sum, ticket) => sum + ticket.lastSalePrice, 0);

  const handleViewQR = async (ticket: TicketType) => {

    setSelectedTicket(ticket);
    try {
      const qrData = JSON.stringify({
        tokenId: ticket.tokenId,
        eventId: ticket.eventId,
        owner: ticket.owner,
        timestamp: Date.now(),
      });
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#ffffff',
          light: '#000000'
        }
      });
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (error) {
      toast({
        title: "QR Generation Failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleTransfer = async () => {
    if (!selectedTicket || !transferAddress) return;

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      transferTicket(selectedTicket.tokenId, transferAddress);
      toast({
        title: "Transfer Successful",
        description: `Ticket #${selectedTicket.tokenId} transferred to ${transferAddress.slice(0, 6)}...${transferAddress.slice(-4)}`,
      });
      setShowTransferModal(false);
      setTransferAddress("");
      setSelectedTicket(null);
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer ticket",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleListForSale = async () => {
    if (!selectedTicket || !listPrice) return;

    const price = parseFloat(listPrice);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const event = getEventById(selectedTicket.eventId);
    if (event) {
      const maxPrice = selectedTicket.lastSalePrice * (1 + event.resalePriceCap / 100);
      if (price > maxPrice) {
        toast({
          title: "Price Too High",
          description: `Maximum allowed price is ${maxPrice.toFixed(4)} ETH (${event.resalePriceCap}% above last sale)`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      listTicketForResale(selectedTicket.tokenId, price);
      toast({
        title: "Listed Successfully",
        description: `Ticket #${selectedTicket.tokenId} listed for ${price} ETH`,
      });
      setShowListModal(false);
      setListPrice("");
      setSelectedTicket(null);
    } catch (error) {
      toast({
        title: "Listing Failed",
        description: "Failed to list ticket for sale",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md mx-auto"
          >
            <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to view your tickets and manage your NFT collection.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your NFT tickets and view transaction history
              </p>
            </div>
            <Badge variant="verified" className="text-sm px-4 py-2">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{listedTickets.length}</p>
                  <p className="text-sm text-muted-foreground">Listed</p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{balance.slice(0,8)} ETH</p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="active">
                Active ({activeTickets.length})
              </TabsTrigger>
              <TabsTrigger value="listed">
                Listed ({listedTickets.length})
              </TabsTrigger>
              <TabsTrigger value="used">
                Used ({usedTickets.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTickets.map((ticket) => {
                    const event = getEventById(ticket.eventId);
                    return (
                      <TicketCard
                        key={ticket.tokenId}
                        ticket={ticket}
                        eventTitle={event?.title || 'Unknown Event'}
                        eventDate={event?.startsAt || new Date()}
                        onViewQR={handleViewQR}
                        onTransfer={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowTransferModal(true);
                        }}
                        onListForSale={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowListModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">No Active Tickets</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any active tickets yet.
                  </p>
                  <Button variant="hero">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listed" className="space-y-6">
              {listedTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listedTickets.map((ticket) => {
                    const event = getEventById(ticket.eventId);
                    return (
                      <TicketCard
                        key={ticket.tokenId}
                        ticket={ticket}
                        eventTitle={event?.title || 'Unknown Event'}
                        eventDate={event?.startsAt || new Date()}
                        onViewQR={handleViewQR}
                        onTransfer={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowTransferModal(true);
                        }}
                        onListForSale={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowListModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">No Listed Tickets</h3>
                  <p className="text-muted-foreground">
                    You haven't listed any tickets for sale yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="used" className="space-y-6">
              {usedTickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usedTickets.map((ticket) => {
                    const event = getEventById(ticket.eventId);
                    return (
                      <TicketCard
                        key={ticket.tokenId}
                        ticket={ticket}
                        eventTitle={event?.title || 'Unknown Event'}
                        eventDate={event?.startsAt || new Date()}
                        onViewQR={handleViewQR}
                        onTransfer={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowTransferModal(true);
                        }}
                        onListForSale={(ticket) => {
                          setSelectedTicket(ticket);
                          setShowListModal(true);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-2">No Used Tickets</h3>
                  <p className="text-muted-foreground">
                    You haven't used any tickets yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">Transaction History</h3>
                <p className="text-muted-foreground">
                  Transaction history will be displayed here showing all your ticket purchases,
                  transfers, and sales with blockchain confirmations.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* QR Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code at the event entrance for verification
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCodeUrl} alt="Ticket QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Token ID: {selectedTicket?.tokenId}</p>
              <p>Event: {getEventById(selectedTicket?.eventId || '')?.title}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Transfer Ticket</DialogTitle>
            <DialogDescription>
              Enter the wallet address to transfer this ticket to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transfer-address">Recipient Address</Label>
              <Input
                id="transfer-address"
                placeholder="0x..."
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleTransfer}
                disabled={!transferAddress || isProcessing}
              >
                {isProcessing ? "Processing..." : "Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* List for Sale Modal */}
      <Dialog open={showListModal} onOpenChange={setShowListModal}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>List for Sale</DialogTitle>
            <DialogDescription>
              Set your asking price for this ticket
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-price">Price (ETH)</Label>
              <Input
                id="list-price"
                type="number"
                step="0.001"
                placeholder="0.025"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
              />
              {selectedTicket && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last sale: {selectedTicket.lastSalePrice} ETH
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowListModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleListForSale}
                disabled={!listPrice || isProcessing}
              >
                {isProcessing ? "Processing..." : "List for Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;