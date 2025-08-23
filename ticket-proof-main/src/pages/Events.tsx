import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoStore } from "@/store/demoStore";
import { Search, Filter, Calendar, MapPin } from "lucide-react";
import { Event, EventFormData } from "@/types";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";


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





const Events = () => {
  // const { events } = useDemoStore();
  const [events, setEvents] = useState<EventFormData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");



  useEffect(() => {
    async function getAllEvents(): Promise<EventFormData[]> {
      try {
        const querySnapshot = await getDocs(collection(db, "Events"));
        const events: EventFormData[] = [];

        querySnapshot.forEach((doc) => {
          events.push({
            ...doc.data(),
          } as EventFormData);
        });

        return events;
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    }
    getAllEvents().then((events) => {
      setEvents(events)
    });
  }, [])

  // const filterEvents = (events: EventFormData[]) => {
  //   let filtered;

  //   // Search filter
  //   if (searchQuery) {
  //     filtered = events.filter(
  //       (event) =>
  //         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         event.venue.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   // Status filter
  //   if (statusFilter !== "all") {
  //     filtered = filtered.filter((event) => event.status === statusFilter);
  //   }

  //   // Sort
  //   // filtered.sort((a, b) => {
  //   //   switch (sortBy) {
  //   //     case "date":
  //   //       return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  //   //     case "price-low":
  //   //       return a.basePrice - b.basePrice;
  //   //     case "price-high":
  //   //       return b.basePrice - a.basePrice;
  //   //     case "popular":
  //   //       return b.soldCount - a.soldCount;
  //   //     default:
  //   //       return 0;
  //   //   }
  //   // });

  //   return filtered;
  // };

  // const filteredEvents = filterEvents(events);

  const statusOptions = [
    { value: "all", label: "All Events" },
    { value: "upcoming", label: "Upcoming" },
    { value: "live", label: "Live Sale" },
    { value: "sold-out", label: "Sold Out" },
    { value: "ended", label: "Ended" },
  ];

  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const getStatusCount = (status: string) => {
    if (status === "all") return events.length;
    return events.filter((event) => event.status === status).length;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover <span className="bg-gradient-primary bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore amazing events with NFT-powered tickets. Secure, transparent, and fair.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({getStatusCount(option.value)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {statusOptions.slice(1).map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(option.value)}
                className="text-xs"
              >
                {option.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getStatusCount(option.value)}
                </Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing Events of {events.length} events
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        </motion.div>

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <EventCard key={event.contractAddress} event={event} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No events match "${searchQuery}"`
                : "No events match your current filters"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Events;