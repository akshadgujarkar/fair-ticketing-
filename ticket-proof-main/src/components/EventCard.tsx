import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import { Event, EventFormData } from "@/types";
import { useNavigate } from "react-router-dom";
import { Contract, ethers } from "ethers";
import { useEffect, useState } from "react";
import abi from '../context/EventTicketNFT.json'

interface EventCardProps {
  event: EventFormData;
  index?: number;
}

export const EventCard = ({ event, index = 0 }: EventCardProps) => {
  const navigate = useNavigate();
  const { contractAddress } = event;
  const [availableTickets, setAvailableTickets] = useState(0)
   const [sold,setSold] = useState(0);

  useEffect(() => {
    async function setTicketsAva() {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi.abi, signer);
      const rTickets = await contract?.remainingTickets();
      const sTickets = await contract?.ticketsMinted();
      setAvailableTickets(rTickets.toString());
      setSold(sTickets.toString());
    }
    setTicketsAva()
  }, [])



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

  const getStatusVariant = (status: Event['status']) => {
    switch (status) {
      case 'live': return 'active';
      case 'sold-out': return 'destructive';
      case 'ended': return 'used';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: Event['status']) => {
    switch (status) {
      case 'live': return 'Live Sale';
      case 'sold-out': return 'Sold Out';
      case 'ended': return 'Ended';
      case 'upcoming': return 'Coming Soon';
      default: return status;
    }
  };
  const soldPercentage = (event.soldCount / event.totalSupply) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="ticket-card overflow-hidden cursor-pointer h-full">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={'../src/assets/chainfest-hero.jpg'}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge variant={getStatusVariant(event.status)}>
              {getStatusText(event.status)}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="verified">Verified</Badge>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="flex items-center text-muted-foreground mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">{formatDate(event.startsAt)}</span>
            </div>

            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.venue}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Ticket className="w-4 h-4 mr-1" />
                <span>{availableTickets} available</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                <span>{sold} sold</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold">{event.basePrice} Wei</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ETH {(ethers.formatEther(event?.basePrice)).toLocaleString().slice(0)}
                </span>
              </div>

              <Button
                variant={event.status === 'live' ? 'hero' : 'outline'}
                size="sm"
                disabled={event.status === 'sold-out' || event.status === 'ended' || event.status === 'upcoming'}
                onClick={() => navigate(`/events/${contractAddress}`)}
              >
                {event.status === 'live' ? 'Buy Now' : 'View Details'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};