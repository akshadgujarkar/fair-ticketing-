import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { QrCode, Send, DollarSign, MoreHorizontal, Eye } from "lucide-react";
import { Ticket } from "@/types";
import { useDemoStore } from "@/store/demoStore";

interface TicketCardProps {
  ticket: Ticket;
  eventTitle: string;
  eventDate: Date;
  onViewQR: (ticket: Ticket) => void;
  onTransfer: (ticket: Ticket) => void;
  onListForSale: (ticket: Ticket) => void;
}

export const TicketCard = ({
  ticket,
  eventTitle,
  eventDate,
  onViewQR,
  onTransfer,
  onListForSale
}: TicketCardProps) => {
  const { getEventById } = useDemoStore();
  const event = getEventById(ticket.eventId);

  const getStatusVariant = (state: Ticket['state']) => {
    switch (state) {
      case 'active': return 'active';
      case 'listed': return 'listed';
      case 'used': return 'used';
      default: return 'secondary';
    }
  };

  const getStatusText = (state: Ticket['state']) => {
    switch (state) {
      case 'active': return 'Active';
      case 'listed': return 'Listed for Sale';
      case 'used': return 'Used';
      default: return state;
    }
  };
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

  const canResell = event && !event.resaleLockedUntilSoldOut || (event && event.soldCount >= event.totalSupply);
  const isActive = ticket.state === 'active';
  const canTransfer = isActive && !ticket.usedDate;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="ticket-card p-6 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary" />
          <QrCode className="absolute top-4 right-4 w-16 h-16 opacity-20" />
        </div>

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{eventTitle}</h3>
              <p className="text-sm text-muted-foreground">{formatDate(eventDate)}</p>
              <p className="text-xs text-muted-foreground">Token #{ticket.tokenId}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(ticket.state)}>
                {getStatusText(ticket.state)}
              </Badge>
              {ticket.resaleCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Resold {ticket.resaleCount}x
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Last Price:</span>
              <span className="ml-2 font-medium">{ticket.lastSalePrice} ETH</span>
            </div>
            <div>
              <span className="text-muted-foreground">Purchased:</span>
              <span className="ml-2 font-medium">{formatDate(ticket.purchaseDate)}</span>
            </div>
          </div>

          {ticket.usedDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Used:</span>
              <span className="ml-2 font-medium">{formatDate(ticket.usedDate)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewQR(ticket)}
            >
              <QrCode className="w-4 h-4 mr-2" />
              View QR
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={ticket.state === 'used'}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card">
                {canTransfer && (
                  <DropdownMenuItem onClick={() => onTransfer(ticket)}>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer
                  </DropdownMenuItem>
                )}

                {isActive && canResell && (
                  <DropdownMenuItem onClick={() => onListForSale(ticket)}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    List for Sale
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  View History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};