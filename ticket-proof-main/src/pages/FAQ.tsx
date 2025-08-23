import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Shield, 
  Zap, 
  Globe, 
  HelpCircle, 
  ExternalLink,
  Wallet,
  Ticket,
  Users,
  DollarSign,
  Calendar,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

const FAQ = () => {
  const faqSections = [
    {
      title: "Getting Started",
      icon: Zap,
      items: [
        {
          question: "What is ChainTix?",
          answer: "ChainTix is a Web3 ticketing platform that uses blockchain technology to create NFT-based tickets. Each ticket is a unique digital asset stored on the Ethereum blockchain, providing unprecedented security, transparency, and anti-fraud protection."
        },
        {
          question: "How do I connect my wallet?",
          answer: "Click the 'Connect Wallet' button in the top navigation. We support MetaMask, WalletConnect, and other major Ethereum wallets. Make sure you're connected to the Sepolia testnet for demo purposes."
        },
        {
          question: "What is Demo Mode?",
          answer: "Demo Mode allows you to experience ChainTix without needing actual cryptocurrency or smart contracts. All transactions are simulated and stored locally in your browser for testing purposes."
        },
        {
          question: "Do I need cryptocurrency to buy tickets?",
          answer: "For real events, yes - tickets are priced in ETH. In Demo Mode, we simulate wallet balances so you can test the purchasing flow without spending real money."
        }
      ]
    },
    {
      title: "Security & Trust",
      icon: Shield,
      items: [
        {
          question: "How does blockchain prevent ticket fraud?",
          answer: "Each ticket is a unique NFT with an immutable record on the blockchain. This makes counterfeiting impossible since the blockchain verifies true ownership. QR codes are linked to on-chain data that can't be faked."
        },
        {
          question: "What happens if I lose my wallet?",
          answer: "Your tickets are stored in your wallet, not on our platform. If you lose access to your wallet without a backup, your tickets may be lost. Always keep your seed phrase secure and consider using a hardware wallet for valuable tickets."
        },
        {
          question: "How is my personal data protected?",
          answer: "ChainTix is decentralized - we don't store personal data on our servers. Your tickets and transaction history are stored on the blockchain, which is public but pseudonymous (linked to wallet addresses, not personal identities)."
        },
        {
          question: "Are my transactions public?",
          answer: "Yes, all blockchain transactions are public and can be viewed on Etherscan. However, they're only linked to your wallet address, not your personal identity, providing pseudonymous transparency."
        }
      ]
    },
    {
      title: "Buying & Selling",
      icon: DollarSign,
      items: [
        {
          question: "What are the purchase limits?",
          answer: "Event organizers set per-wallet limits (typically 2-5 tickets) to prevent scalping. These limits are enforced by smart contracts and cannot be bypassed by creating multiple transactions."
        },
        {
          question: "How does the resale system work?",
          answer: "Tickets can be resold on our marketplace with built-in price caps (e.g., maximum 20% above last sale price). Resales may be locked until the event is sold out to ensure primary sales complete first."
        },
        {
          question: "What fees are involved?",
          answer: "Primary sales include a small platform fee (typically 2.5%). Resales include a 40% total fee: 10% to the platform and 30% to the artist/organizer as royalties, with 60% going to the seller."
        },
        {
          question: "How do artist royalties work?",
          answer: "Artists receive a percentage (usually 30%) of resale prices for the first two resales of each ticket. This ensures creators benefit from secondary market activity while still allowing fans to resell tickets."
        }
      ]
    },
    {
      title: "Using Your Tickets",
      icon: Ticket,
      items: [
        {
          question: "How do I show my ticket at the event?",
          answer: "Your ticket includes a QR code that event staff can scan. The QR code contains your ticket's blockchain data, which verifies your ownership in real-time. You can access this from your dashboard."
        },
        {
          question: "Can I transfer tickets to someone else?",
          answer: "Yes! You can transfer tickets directly to another wallet address through your dashboard. This is useful for gifting tickets or changing who will attend the event."
        },
        {
          question: "What happens after I use my ticket?",
          answer: "Once scanned at the event entrance, your ticket is marked as 'used' on the blockchain. Used tickets cannot be resold or used again, preventing double-entry fraud."
        },
        {
          question: "Can I get a refund?",
          answer: "Refund policies depend on the event organizer and are typically handled through the resale marketplace rather than direct refunds. Check the event details for specific refund policies."
        }
      ]
    },
    {
      title: "Technical Information",
      icon: Globe,
      items: [
        {
          question: "Which blockchain networks are supported?",
          answer: "ChainTix currently operates on Ethereum mainnet and Sepolia testnet. We may expand to other EVM-compatible networks like Polygon in the future based on user demand and gas cost considerations."
        },
        {
          question: "What are gas fees?",
          answer: "Gas fees are transaction costs on the Ethereum network. These go to miners/validators, not to ChainTix. Fees vary based on network congestion. Consider gas costs when timing your transactions."
        },
        {
          question: "How can I view my transaction history?",
          answer: "All your transactions are visible on the blockchain. You can view them through your dashboard or directly on Etherscan using your wallet address or transaction hashes."
        },
        {
          question: "What if the website goes down?",
          answer: "Your tickets exist on the blockchain, not our website. Even if ChainTix disappeared, you'd still own your NFT tickets and could interact with them through other blockchain tools or wallets."
        }
      ]
    }
  ];

  const quickLinks = [
    { title: "Browse Events", href: "/events", icon: Calendar },
    { title: "My Dashboard", href: "/dashboard", icon: Users },
    { title: "Create Event", href: "/organizer", icon: Plus },
    { title: "Verify Tickets", href: "/verify", icon: Shield },
  ];

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
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Frequently Asked <span className="bg-gradient-primary bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Web3 ticketing, blockchain security, and using ChainTix
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Links Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="glass-card p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link key={link.href} to={link.href}>
                    <Button variant="ghost" className="w-full justify-start">
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.title}
                    </Button>
                  </Link>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-semibold mb-3">Need More Help?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community for real-time support and updates.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Discord Community
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + sectionIndex * 0.1 }}
              >
                <Card className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <AccordionItem 
                        key={itemIndex} 
                        value={`${sectionIndex}-${itemIndex}`}
                        className="border border-border/50 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testnet Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="glass-card p-8">
            <div className="text-center">
              <Badge variant="warning" className="text-sm px-4 py-2 mb-4">
                Testnet Notice
              </Badge>
              <h3 className="text-2xl font-bold mb-4">Currently Running on Sepolia Testnet</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                This demo runs on Ethereum's Sepolia testnet. No real money is involved. 
                Get free testnet ETH from faucets to try purchasing tickets. All transactions 
                and tickets are for demonstration purposes only.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sepolia Faucet
                </Button>
                <Button variant="outline" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Sepolia Etherscan
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;