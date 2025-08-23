import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { WalletConnect } from "@/components/WalletConnect";
import { useDemoStore } from "@/store/demoStore";
import { useWallet } from "@/hooks/useWallet";
import { Shield, Zap, Globe, ArrowRight, Ticket, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { events } = useDemoStore();
  const { isConnected } = useWallet();
  const featuredEvents = events.slice(0, 3);

  const features = [
    {
      icon: Shield,
      title: "Secure & Trustless",
      description: "Each ticket is a unique NFT stored on-chain. No counterfeits, no fraud.",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "QR codes linked to blockchain ownership. Verify authenticity in seconds.",
    },
    {
      icon: Globe,
      title: "Fair Resale Market",
      description: "Anti-scalping rules and price caps ensure fair secondary market prices.",
    },
  ];

  const stats = [
    { icon: Ticket, label: "Tickets Sold", value: "150,000+" },
    { icon: Users, label: "Happy Customers", value: "45,000+" },
    { icon: TrendingUp, label: "Events Hosted", value: "500+" },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="web3" className="mb-6 text-sm px-4 py-2">
              🚀 Powered by Blockchain Technology
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Secure. Fair.
              </span>
              <br />
              <span className="text-foreground">Impossible to Fake.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Own your ticket. Prove it on-chain. Experience the future of event ticketing 
              with NFT-powered tickets that eliminate fraud and ensure fair pricing.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {!isConnected ? (
                <>
                  <WalletConnect />
                  <Link to="/events">
                    <Button variant="outline" size="lg">
                      Browse Events
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/events">
                    <Button variant="hero" size="xl">
                      Explore Events
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="lg">
                      My Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How <span className="bg-gradient-primary bg-clip-text text-transparent">ChainTix</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionary Web3 technology meets seamless user experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card p-8 text-center h-full hover:shadow-neon transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Featured Events</h2>
              <p className="text-xl text-muted-foreground">Discover amazing events powered by blockchain</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* {featuredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))} */}
            </div>

            <div className="text-center">
              <Link to="/events">
                <Button variant="hero" size="lg">
                  View All Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who trust ChainTix for secure, transparent, and fair ticketing.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/events">
                <Button variant="hero" size="xl">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
