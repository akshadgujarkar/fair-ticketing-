import abi from '../context/EventTicketNFT.json'
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
import {
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
  Users,
  Shield,
  Plus,
  Settings
} from "lucide-react";
import { etherContext } from "@/context/etherFirebase";
import { ethers } from 'ethers';
import { collection, doc, getFirestore, setDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';



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




const Organizer = () => {
  const { toast } = useToast();
  // const { addEvent } = useDemoStore();
  // const { isConnected, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
 

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    totalSupply: 0,
    basePrice: 0.0,
    perWalletLimit: 3,
    royaltyPlatform: 10,
    royaltyArtist: 30,
    resalePriceCap: 35,
    resaleLockedUntilSoldOut: true,
  });


  useEffect(()=>{
    if(localStorage.getItem("address")){
      setIsConnected(true);
      setAddress(localStorage.getItem("address"))
      return;
    }
  },[])



  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create events",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const startsAt = new Date(`${formData.startDate}T${formData.startTime}`);
      const endsAt = new Date(`${formData.endDate}T${formData.endTime}`);


      // call contract and firebase functions here
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(
        abi.abi,
        abi.bytecode,
        signer
      );
      const contract = await factory.deploy(formData.title, "TIC", formData.totalSupply, formData.basePrice, "firebase");
      await contract.waitForDeployment();
      const addressC = await contract.getAddress();

      const eventData = {
        title: formData.title,
        venue: formData.venue,
        description: formData.description,
        contractAddress: addressC,
        startsAt,
        Time: formData.startTime,
        totalSupply: formData.totalSupply,  // use as available
        soldCount: 0,
        basePrice: formData.basePrice,
        perWalletLimit: formData.perWalletLimit,
        royaltyPlatform: formData.royaltyPlatform,
        royaltyArtist: formData.royaltyArtist,
        resalePriceCap: formData.resalePriceCap,
        resaleLockedUntilSoldOut: formData.resaleLockedUntilSoldOut,
        coverImage: '/api/placeholder/600/400',
        status: 'live' as const,
        organizerId: address,
      };

      const docRef = doc(collection(db, "Events"), eventData.title);
      await setDoc(docRef, eventData);

      toast({
        title: "Event Created Successfully!",
        description: `${formData.title} has been created with ${formData.totalSupply} tickets`,
      });

      // Reset form
      setFormData({
        title: "",
        venue: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        totalSupply: 500,
        basePrice: 0.02,
        perWalletLimit: 2,
        royaltyPlatform: 10,
        royaltyArtist: 30,
        resalePriceCap: 20,
        resaleLockedUntilSoldOut: true,
      });

    } catch (error) {
      toast({
        title: "Creation Failed or firebase ",
        description: error?.message || "faised",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
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
            <Settings className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Organizer Access Required</h1>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to access the organizer console and create events.
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
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Organizer Console</h1>
              <p className="text-muted-foreground">Create and manage your Web3 events</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card className="glass-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Plus className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Create New Event</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Ticket className="w-5 h-5 mr-2" />
                      Event Details
                    </h3>

                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="ChainFest Live 2025"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => handleInputChange('venue', e.target.value)}
                        placeholder="Madison Square Garden, New York"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your event..."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Date & Time */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Schedule
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Ticketing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Ticketing Configuration
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="totalSupply">Total Supply</Label>
                        <Input
                          id="totalSupply"
                          type="number"
                          value={formData.totalSupply}
                          onChange={(e) => handleInputChange('totalSupply', parseInt(e.target.value))}
                          min={1}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="basePrice">Base Price (Wei)</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          step="0.001"
                          value={formData.basePrice}
                          onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value))}
                          min={0}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="perWalletLimit">Per Wallet Limit</Label>
                      <Input
                        id="perWalletLimit"
                        type="number"
                        value={formData.perWalletLimit}
                        onChange={(e) => handleInputChange('perWalletLimit', parseInt(e.target.value))}
                        min={1}
                        max={10}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Royalties & Resale */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Royalties & Resale
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="royaltyPlatform">Platform Fee (%)</Label>
                        <Input
                          id="royaltyPlatform"
                          type="number"
                          value={formData.royaltyPlatform}
                          onChange={(e) => handleInputChange('royaltyPlatform', parseInt(e.target.value))}
                          min={0}
                          max={50}
                        />
                      </div>
                      <div>
                        <Label htmlFor="royaltyArtist">Artist Royalty (%)</Label>
                        <Input
                          id="royaltyArtist"
                          type="number"
                          value={formData.royaltyArtist}
                          onChange={(e) => handleInputChange('royaltyArtist', parseInt(e.target.value))}
                          min={0}
                          max={50}
                        />
                      </div>
                      <div>
                        <Label htmlFor="resalePriceCap">Resale Cap (%)</Label>
                        <Input
                          id="resalePriceCap"
                          type="number"
                          value={formData.resalePriceCap}
                          onChange={(e) => handleInputChange('resalePriceCap', parseInt(e.target.value))}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="resaleLockedUntilSoldOut"
                        checked={formData.resaleLockedUntilSoldOut}
                        onCheckedChange={(checked) => handleInputChange('resaleLockedUntilSoldOut', checked)}
                      />
                      <Label htmlFor="resaleLockedUntilSoldOut">
                        Lock resales until sold out
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating Event..." : "Create Event"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Anti-Scalping Features
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Per-wallet limit:</span>
                    <span className="font-medium">{formData.perWalletLimit} tickets</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resale price cap:</span>
                    <span className="font-medium">+{formData.resalePriceCap}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resale locked:</span>
                    <span className="font-medium">
                      {formData.resaleLockedUntilSoldOut ? 'Until sold out' : 'No'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Revenue Breakdown</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Primary sales:</span>
                    <span className="font-medium">
                      {(formData.totalSupply * formData.basePrice).toFixed(1)} Wei
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform keeps:</span>
                    <span className="font-medium">{formData.royaltyPlatform}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Artist royalty:</span>
                    <span className="font-medium">{formData.royaltyArtist}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>You receive:</span>
                    <span>
                      {(formData.totalSupply * formData.basePrice * (100 - formData.royaltyPlatform) / 100).toFixed(1)} Wei
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4">Resale Revenue</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>On secondary sales, you receive {formData.royaltyArtist}% royalty for the first 2 resales of each ticket.</p>
                  <p>Platform fee: {formData.royaltyPlatform}%</p>
                  <p>Seller receives: {100 - formData.royaltyPlatform - formData.royaltyArtist}%</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organizer;