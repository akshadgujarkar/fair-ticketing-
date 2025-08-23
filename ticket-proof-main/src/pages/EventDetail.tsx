import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  MapPin,
  Ticket,
  Users,
  Shield,
  TrendingUp,
  Minus,
  Plus,
  ExternalLink,
  Info
} from "lucide-react";
import { EventFormData } from "@/types";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { Contract, ethers } from "ethers";
import abi from '../context/EventTicketNFT.json'
import { useDemoStore } from "@/store/demoStore";



const firebaseConfig = {
  apiKey: "AIzaSyAh9YgUGaBZrTLRzAYf5doVNUmMde6jeD4",
  authDomain: "fair-ticketing.firebaseapp.com",
  projectId: "fair-ticketing",
  storageBucket: "fair-ticketing.appspot.com", // ✅ fixed
  messagingSenderId: "355933535721",
  appId: "1:355933535721:web:f807b1b63faf1912245f78",
  measurementId: "G-Q7YNX6C1NL"
};

// Avoid re-initializing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firestore
const db = getFirestore(app);


const EventDetail = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();

  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [event, setEvent] = useState<EventFormData>();
  const [availableTickets, setAvailableTickets] = useState(0)
  const {purchaseTicket} = useDemoStore();
  const [sold, setSold] = useState(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [max, setMax] = useState(0);

  function savePurchase(buyer: string, tokenId: bigint, contractAddress: string) {
    let purchases = JSON.parse(localStorage.getItem("purchases") || "[]");

    const newPurchase = {
      buyer,
      tokenId: tokenId.toString(), // ✅ convert bigint
      contractAddress,
    };

    purchases.push(newPurchase);
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }




  const formatDate = (date: Date | string) => {
    if (!date) return "Invalid date";
    const d = typeof date === "string" ? new Date(date) : date;


    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);
  };

  useEffect(() => {
    if (localStorage.getItem("address") && !contractAddress) {
      setConnected(true);
      return;
    }
    async function getEventByContract(contractAddress: string): Promise<EventFormData | null> {
      try {
        const q = query(
          collection(db, "Events"),
          where("contractAddress", "==", contractAddress)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No event found with contract:", contractAddress);
          return null;
        }

        // Assuming contractAddress is unique, return first doc
        const docSnap = querySnapshot.docs[0];
        return docSnap.data() as EventFormData;
      } catch (error) {
        console.error("Error fetching event by contract:", error);
        throw error;
      }
    }


    async function setTicketsAva() {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi.abi, signer);
      const rTickets = await contract?.remainingTickets();
      const sTickets = await contract?.ticketsMinted();
      const maxT = await contract?.maxTickets();
      setAvailableTickets(rTickets.toString());
      setSold(sTickets.toString());
      setMax(maxT.toString());
    }

    getEventByContract(contractAddress).then((data) => {
      setEvent(data);
    })

    setTicketsAva();

  })



  const handlePurchase = async () => {

    setIsPurchasing(true);

    try {

      // simulate purchase ticket from contract 
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi.abi, signer);
      if (!contract) {
        alert("contract not found")
        return;
      }
      contract?.once("TicketBuyedSuccessfully", (buyer: string, tokenId: bigint, contractAddress: string) => {
        savePurchase(buyer, tokenId, contractAddress);
        toast(
          {
            title: "NFT Purchased successfully (Token Added)"
          }
        )

      });
      await contract?.buyTicket(quantity, { value: event?.basePrice });
      const add = await signer.getAddress()
      purchaseTicket(Date.now().toString(),add,quantity);


      toast({
        title: "Purchase Successful!",
        description: `Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''} for `,
      });

      setQuantity(1);
    } catch (error) {
      toast({
        title: error.message,
        description: "Failed to purchase tickets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const soldPercentage = (Number(sold) / Number(max)) * 100;
  const resaleEnabled = true;
  const canPurchase = true;
  const maxQuantity = 7;
  const platformFee = (2 / 100) * event?.basePrice;


  // const platformFee = totalPrice * 0.025; // 2.5% platform fee
  // const finalPrice = totalPrice + platformFee;



  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                <img
                  src={'../src/assets/chainfest-hero.jpg'}
                  alt={event?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="verified">Verified Organizer</Badge>
                    <Badge variant={event?.status === 'live' ? 'active' : 'secondary'}>
                      {event?.status === 'live' ? 'Live Sale' : event?.status}
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {event?.title}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event?.startsAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{event?.venue}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event?.description}</p>
              </Card>
            </motion.div>

            {/* Supply & Pricing Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="glass-card p-6">
                <h2 className="text-2xl font-bold mb-6">Ticket Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Ticket className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{availableTickets}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold">{sold && sold}</p>
                    <p className="text-sm text-muted-foreground">Sold</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-2xl font-bold">{soldPercentage.toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Sold</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sales Progress</span>
                      <span>{sold && sold} / {event?.totalSupply}</span>
                    </div>
                    <Progress value={soldPercentage} className="h-3" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Per Wallet Limit:</span>
                      <span className="ml-2 font-medium">{event?.perWalletLimit} tickets</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resale Cap:</span>
                      <span className="ml-2 font-medium">+{event?.resalePriceCap}% max</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Platform Fee:</span>
                      <span className="ml-2 font-medium">{event?.royaltyPlatform}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Artist Royalty:</span>
                      <span className="ml-2 font-medium">{event?.royaltyArtist}%</span>
                    </div>
                  </div>

                  {!resaleEnabled && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-warning">Resale Locked</p>
                          <p className="text-sm text-warning/80">
                            Ticket resales are disabled until all {event?.totalSupply} tickets are sold.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="sticky top-24"
            >
              <Card className="glass-card p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">{event?.basePrice} Wei</div>
                  <div className="text-muted-foreground">
                    ~${event?.basePrice ? (Number(ethers.formatEther(String(event?.basePrice))) * 2500).toLocaleString() : '0'} USD
                  </div>
                </div>

                {canPurchase ? (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity (Max: {maxQuantity})
                      </Label>
                      <div className="flex items-center space-x-3 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="text-center"
                          min={1}
                          max={maxQuantity}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                          disabled={quantity >= maxQuantity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tickets ({quantity}x)</span>
                        <span>{event?.basePrice.toFixed(1)} Wei</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Platform Fee (2.5%)</span>
                        <span>{platformFee.toFixed(1)} Wei</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{event?.basePrice.toFixed(1)} Wei</span>
                      </div>
                    </div>

                    {!connected ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="hero"
                            size="lg"
                            className="w-full"
                            disabled={!canPurchase || isPurchasing}
                          >
                            {isPurchasing ? "Processing..." : "Purchase Tickets"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card">
                          <DialogHeader>
                            <DialogTitle>Confirm Purchase</DialogTitle>
                            <DialogDescription>
                              Review your purchase details before confirming.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Event:</span>
                                <span className="font-medium">{event?.title}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quantity:</span>
                                <span className="font-medium">{quantity} ticket{quantity > 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Cost:</span>
                                <span className="font-medium">{event?.basePrice.toFixed(1)} Wei</span>
                              </div>
                            </div>
                            <Button
                              variant="hero"
                              className="w-full"
                              onClick={handlePurchase}
                              disabled={isPurchasing}
                            >
                              {isPurchasing ? "Processing..." : "Confirm Purchase"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button variant="hero" size="lg" className="w-full">
                        Connect Wallet to Purchase
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <Badge variant="destructive" className="text-sm">
                      {event?.status === 'sold-out' ? 'Sold Out' : 'Sale Ended'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Primary sale has ended. Check the secondary market for available tickets.
                    </p>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Secondary Market
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secured by blockchain technology</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;