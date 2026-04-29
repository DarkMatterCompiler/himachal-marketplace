import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Textarea } from 'components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from 'components/ui/dialog';
import { useAuth } from 'context/AuthContext';
import { toast } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';

export const SellerVerificationPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchPendingSellers();
  }, [isAdmin, navigate]);

  const fetchPendingSellers = async () => {
    try {
      // Mock data - replace with API call
      setSellers([
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phoneNumber: '+91 98765 43210',
          locationVillage: 'Manali',
          sellerType: 'ARTISAN',
          bio: 'Traditional woodcarving artisan with 15 years of experience',
          taxId: '22AAAAA0000A1Z5',
          bankDetails: {
            accountHolderName: 'Rajesh Kumar',
            accountNumber: '****1234',
            ifscCode: 'SBIN0001234',
            bankName: 'State Bank of India'
          },
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          verificationStatus: 'PENDING'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      // API call to approve seller
      // await adminAPI.approveSeller(selectedSeller.id);
      toast.success('Seller approved successfully');
      setShowApproveDialog(false);
      setSelectedSeller(null);
      fetchPendingSellers();
    } catch (error) {
      toast.error('Failed to approve seller');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      // API call to reject seller
      // await adminAPI.rejectSeller(selectedSeller.id, rejectionReason);
      toast.success('Seller application rejected');
      setShowRejectDialog(false);
      setSelectedSeller(null);
      setRejectionReason('');
      fetchPendingSellers();
    } catch (error) {
      toast.error('Failed to reject seller');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Seller Verification</h1>
          <p className="text-muted-foreground">
            Review and approve seller applications
          </p>
        </motion.div>

        {sellers.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="font-serif text-2xl font-semibold mb-2">All Caught Up!</h2>
            <p className="text-muted-foreground">No pending seller verifications</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {sellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-semibold">{seller.name}</h3>
                        <Badge variant="outline" className="mt-2">{seller.sellerType}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{seller.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{seller.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{seller.locationVillage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h4 className="font-medium mb-3">Bank Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Holder:</span>
                          <span>{seller.bankDetails.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account:</span>
                          <span>{seller.bankDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IFSC:</span>
                          <span>{seller.bankDetails.ifscCode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span>{seller.bankDetails.bankName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">{seller.bio}</p>
                  </div>

                  {seller.taxId && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Tax Information</h4>
                      <p className="text-sm text-muted-foreground">GST/Tax ID: {seller.taxId}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      onClick={() => {
                        setSelectedSeller(seller);
                        setShowApproveDialog(true);
                      }}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedSeller(seller);
                        setShowRejectDialog(true);
                      }}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Seller</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to approve {selectedSeller?.name}? They will be able to start selling on the platform.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Seller Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Please provide a reason for rejecting {selectedSeller?.name}'s application:</p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
