import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDemoStore } from "@/store/demoStore";
import { toast } from "@/hooks/use-toast";
import { 
  Camera, 
  Scan, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Ticket
} from "lucide-react";

const Verify = () => {
  const { tickets, getEventById, useTicket } = useDemoStore();
  const [isScanning, setIsScanning] = useState(false);
  const [manualTokenId, setManualTokenId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleManualVerification = () => {
    if (!manualTokenId.trim()) {
      toast({
        title: "Token ID Required",
        description: "Please enter a token ID to verify",
        variant: "destructive",
      });
      return;
    }

    const ticket = tickets.find(t => t.tokenId === manualTokenId.trim());
    
    if (!ticket) {
      setVerificationResult({
        status: 'invalid',
        message: 'Ticket not found',
        details: 'This token ID does not exist in our system',
      });
      return;
    }

    const event = getEventById(ticket.eventId);
    
    if (!event) {
      setVerificationResult({
        status: 'invalid',
        message: 'Event not found',
        details: 'The event associated with this ticket could not be found',
      });
      return;
    }

    if (ticket.state === 'used') {
      setVerificationResult({
        status: 'used',
        message: 'Ticket already used',
        details: `This ticket was used on ${ticket.usedDate?.toLocaleDateString()}`,
        ticket,
        event,
      });
      return;
    }

    if (ticket.state !== 'active') {
      setVerificationResult({
        status: 'invalid',
        message: 'Ticket not active',
        details: `This ticket is currently ${ticket.state}`,
        ticket,
        event,
      });
      return;
    }

    // Check if event has started
    const now = new Date();
    const eventStart = new Date(event.startsAt);
    const eventEnd = new Date(event.endsAt);

    if (now < eventStart) {
      setVerificationResult({
        status: 'early',
        message: 'Event has not started',
        details: `Event starts on ${eventStart.toLocaleDateString()} at ${eventStart.toLocaleTimeString()}`,
        ticket,
        event,
      });
      return;
    }

    if (now > eventEnd) {
      setVerificationResult({
        status: 'expired',
        message: 'Event has ended',
        details: `Event ended on ${eventEnd.toLocaleDateString()} at ${eventEnd.toLocaleTimeString()}`,
        ticket,
        event,
      });
      return;
    }

    setVerificationResult({
      status: 'valid',
      message: 'Valid ticket',
      details: 'This ticket is valid for entry',
      ticket,
      event,
    });
  };

  const handleMarkAsUsed = async () => {
    if (!verificationResult?.ticket) return;

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      useTicket(verificationResult.ticket.tokenId);
      
      toast({
        title: "Ticket Marked as Used",
        description: `Ticket #${verificationResult.ticket.tokenId} has been marked as used`,
      });

      setVerificationResult({
        ...verificationResult,
        status: 'used',
        message: 'Ticket marked as used',
        details: 'This ticket has been successfully verified and marked as used',
      });

      setManualTokenId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark ticket as used",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'used': return 'used';
      case 'invalid': return 'destructive';
      case 'early': return 'warning';
      case 'expired': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return CheckCircle;
      case 'used': return Shield;
      case 'invalid': return XCircle;
      case 'early': 
      case 'expired': return AlertTriangle;
      default: return Shield;
    }
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
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Ticket <span className="bg-gradient-primary bg-clip-text text-transparent">Verification</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verify ticket authenticity and mark attendance with blockchain-powered security
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Scanner Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-3" />
                QR Code Scanner
              </h2>

              {!isScanning ? (
                <div className="text-center space-y-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center max-w-sm mx-auto">
                    <div className="text-center">
                      <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Camera preview will appear here</p>
                    </div>
                  </div>
                  
                  <Button onClick={handleCameraAccess} variant="hero" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                      <div className="absolute inset-4 border border-white/50 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={stopScanning} variant="outline" className="flex-1">
                      Stop Scanning
                    </Button>
                    <Button variant="hero" className="flex-1">
                      Capture QR
                    </Button>
                  </div>
                  
                  <Alert>
                    <Scan className="w-4 h-4" />
                    <AlertDescription>
                      Point the camera at the QR code on the ticket. Make sure the code is clearly visible.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Manual Entry Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Ticket className="w-6 h-6 mr-3" />
                Manual Verification
              </h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="tokenId">Token ID</Label>
                  <div className="flex space-x-2 mt-2">
                    <Input
                      id="tokenId"
                      placeholder="Enter token ID..."
                      value={manualTokenId}
                      onChange={(e) => setManualTokenId(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleManualVerification} variant="hero">
                      Verify
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the token ID found on the ticket
                  </p>
                </div>

                {/* Verification Result */}
                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const Icon = getStatusIcon(verificationResult.status);
                          return <Icon className="w-6 h-6 text-current" />;
                        })()}
                        <div>
                          <Badge variant={getStatusColor(verificationResult.status)} className="text-sm">
                            {verificationResult.message}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {verificationResult.details}
                          </p>
                        </div>
                      </div>

                      {verificationResult.ticket && verificationResult.event && (
                        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Event:</span>
                              <p className="font-medium">{verificationResult.event.title}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Token ID:</span>
                              <p className="font-medium">{verificationResult.ticket.tokenId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Owner:</span>
                              <p className="font-medium font-mono text-xs">
                                {verificationResult.ticket.owner.slice(0, 8)}...
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Purchase Date:</span>
                              <p className="font-medium">
                                {verificationResult.ticket.purchaseDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {verificationResult.status === 'valid' && (
                            <Button 
                              onClick={handleMarkAsUsed}
                              variant="success"
                              className="w-full"
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Mark as Used & Allow Entry"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <Card className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-6">Verification Instructions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-primary" />
                  QR Code Scanning
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Click "Start Camera" to access your device camera</li>
                  <li>• Point the camera at the ticket's QR code</li>
                  <li>• Ensure good lighting and steady positioning</li>
                  <li>• The system will automatically detect and verify the code</li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <Ticket className="w-5 h-5 mr-2 text-primary" />
                  Manual Verification
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Enter the token ID manually if QR scanning fails</li>
                  <li>• Token ID can be found on the ticket or in user's wallet</li>
                  <li>• System will verify ownership and usage status</li>
                  <li>• Mark as used only after successful verification</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Security Notice</p>
                  <p className="text-sm text-primary/80 mt-1">
                    All verifications are recorded on the blockchain. Once a ticket is marked as used, 
                    it cannot be reused or transferred. Always verify the ticket holder's identity 
                    matches the wallet address shown.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;