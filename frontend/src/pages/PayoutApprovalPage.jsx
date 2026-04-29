import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
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
  Clock,
  Loader2,
  DollarSign,
  Calendar
} from 'lucide-react';

export const PayoutApprovalPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState([]);
  const [selectedPayouts, setSelectedPayouts] = useState([]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchPendingPayouts();
  }, [isAdmin, navigate]);

  const fetchPendingPayouts = async () => {
    try {
      // Mock data - replace with API call
      setPayouts([
        {
          id: '1',
          sellerName: 'Mountain Crafts',
          sellerId: 'seller1',
          grossAmount: 25000,
          platformFeeDeducted: 2500,
          netPayable: 22500,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          bankDetails: 'SBI ****1234',
          status: 'PENDING'
        },
        {
          id: '2',
          sellerName: 'Himalayan Herbs',
          sellerId: 'seller2',
          grossAmount: 18500,
          platformFeeDeducted: 1850,
          netPayable: 16650,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          bankDetails: 'HDFC ****5678',
          status: 'PENDING'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (payoutId) => {
    setSelectedPayouts(prev =>
      prev.includes(payoutId)
        ? prev.filter(id => id !== payoutId)
        : [...prev, payoutId]
    );
  };

  const selectAll = () => {
    if (selectedPayouts.length === payouts.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(payouts.map(p => p.id));
    }
  };

  const handleApprove = async () => {
    if (selectedPayouts.length === 0) {
      toast.error('Please select at least one payout');
      return;
    }

    if (!paymentReference) {
      toast.error('Please enter payment reference');
      return;
    }

    setProcessing(true);
    try {
      // API call to approve payouts
      // await adminAPI.approvePayouts(selectedPayouts, paymentReference);
      toast.success(`${selectedPayouts.length} payout(s) approved successfully`);
      setShowApproveDialog(false);
      setSelectedPayouts([]);
      setPaymentReference('');
      fetchPendingPayouts();
    } catch (error) {
      toast.error('Failed to approve payouts');
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

  const totalSelected = payouts
    .filter(p => selectedPayouts.includes(p.id))
    .reduce((sum, p) => sum + p.netPayable, 0);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Payout Approval</h1>
          <p className="text-muted-foreground">
            Review and approve pending seller payouts
          </p>
        </motion.div>

        {payouts.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="font-serif text-2xl font-semibold mb-2">All Payouts Processed!</h2>
            <p className="text-muted-foreground">No pending payouts to approve</p>
          </Card>
        ) : (
          <>
            {/* Action Bar */}
            <Card className="p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPayouts.length === payouts.length}
                      onChange={selectAll}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">
                      Select All ({selectedPayouts.length} selected)
                    </span>
                  </label>
                  {selectedPayouts.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                      Total: ₹{totalSelected.toLocaleString()}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  disabled={selectedPayouts.length === 0}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            </Card>

            {/* Payouts List */}
            <div className="space-y-4">
              {payouts.map((payout, index) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-6 ${selectedPayouts.includes(payout.id) ? 'border-2 border-primary' : ''}`}>
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPayouts.includes(payout.id)}
                        onChange={() => toggleSelection(payout.id)}
                        className="w-5 h-5 mt-1 cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-serif text-xl font-semibold mb-1">{payout.sellerName}</h3>
                            <p className="text-sm text-muted-foreground">Payout #{payout.id.slice(0, 8)}</p>
                          </div>
                          <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          {/* Amount Breakdown */}
                          <div>
                            <h4 className="font-medium mb-3 text-sm">Amount Breakdown</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gross Amount:</span>
                                <span>₹{payout.grossAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Platform Fee:</span>
                                <span className="text-orange-600 dark:text-orange-400">
                                  -₹{payout.platformFeeDeducted.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-border font-medium">
                                <span>Net Payable:</span>
                                <span className="text-primary text-lg">₹{payout.netPayable.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div>
                            <h4 className="font-medium mb-3 text-sm">Payment Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>{payout.bankDetails}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  Due: {payout.dueDate.toLocaleDateString()} 
                                  <span className="ml-2 text-muted-foreground">
                                    ({Math.ceil((payout.dueDate - Date.now()) / (1000 * 60 * 60 * 24))}d)
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payouts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm mb-2">
                You are approving <span className="font-medium">{selectedPayouts.length} payout(s)</span>
              </p>
              <p className="text-2xl font-bold text-primary">
                Total Amount: ₹{totalSelected.toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="paymentRef">Payment Reference Number *</Label>
              <Input
                id="paymentRef"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Enter transaction/UTR number"
              />
            </div>
          </div>
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
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Mark as Paid
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
