import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { useWallet, connectDemoWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";
import { useContext, useEffect, useState } from "react";
import { etherContext } from "@/context/etherFirebase";
import { add } from "date-fns";
import { BigNumberish, ethers } from "ethers";
export const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>();

  const getAddressWallet = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();
    const balanceWei = await provider.getBalance(walletAddress);
    const balanceEth = ethers.formatEther(balanceWei);

    setAddress(walletAddress);
    setBalance(balanceEth);
    setIsConnected(true);
    localStorage.setItem("address", walletAddress);

    toast({
      title: "Wallet Connected",
      description: `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    });
  };

  useEffect(() => {
    const storedAddress = localStorage.getItem("address");
    if (storedAddress) {
      setAddress(storedAddress);
      setIsConnected(true);
    }
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem("address");
    setAddress(null);
    setBalance(undefined);
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <Button onClick={getAddressWallet} variant="hero" size="lg" className="font-medium">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="lg" className="font-medium">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{formatAddress(address!)}</span>
              <span className="text-xs text-muted-foreground">{balance} ETH</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Wallet</span>
          <Badge variant="web3">Sepolia</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Etherscan
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
