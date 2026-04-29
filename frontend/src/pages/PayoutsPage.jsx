import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { useAuth } from 'context/AuthContext';
import { payoutAPI } from 'services/api';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  CreditCard
} from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  APPROVED: { label: 'Approved', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 dark:text-green-400' }
};

export const PayoutsPage = () => {
  const { isSeller } = useAuth();
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState([]);
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalCommission: 0
  });

  useEffect(() => {
    if (!isSeller) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchPayouts();
  }, [isSeller, navigate]);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredPayouts(payouts);
    } else {
      setFilteredPayouts(payouts.filter(p => p.status === filter));
    }
  }, [filter, payouts]);

  const fetchPayouts = async () => {
    try {
      const data = await payoutAPI.getSellerPayouts();
      setPayouts(data);
      setFilteredPayouts(data);
      calculateStats(data);
    } catch (error) {
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (payoutsData) => {
    const totalEarnings = payoutsData.reduce((sum, p) => sum + p.grossAmount, 0);
    const pendingAmount = payoutsData
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.netPayable, 0);
    const paidAmount = payoutsData
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.netPayable, 0);
    const totalCommission = payoutsData.reduce((sum, p) => sum + p.platformFeeDeducted, 0);

    setStats({ totalEarnings, pendingAmount, paidAmount, totalCommission });
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
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Payouts</h1>
          <p className="text-muted-foreground">
            Track your earnings and commission breakdown
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">₹{stats.paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Commission</p>
                  <p className="text-2xl font-bold">₹{stats.totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Commission Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 mb-8 border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-2">Commission Structure</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Organic Skincare & Food: 8% + ₹15 per item</p>
                  <p>• Traditional Textiles: 10% + ₹20 per item</p>
                  <p>• Artisan Crafts: 12% + ₹25 per item</p>
                  <p className="mt-2">Payouts are processed weekly and paid within 7 business days after approval.</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'APPROVED', 'PAID'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status === 'ALL' ? 'All Payouts' : statusConfig[status].label}
            </Button>
          ))}
        </div>

        {/* Payouts List */}
        {filteredPayouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-semibold mb-2">No Payouts Yet</h2>
            <p className="text-muted-foreground">
              {filter === 'ALL' ? 'Your payouts will appear here once orders are delivered' : `No payouts with status: ${statusConfig[filter].label}`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredPayouts.map((payout, index) => {
              const StatusIcon = statusConfig[payout.status].icon;

              return (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Payout #{payout.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Gross Amount</span>
                            <span className="font-medium">₹{payout.grossAmount}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                            <span className="text-sm text-muted-foreground">Platform Fee (-)</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">₹{payout.platformFeeDeducted}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <span className="text-sm font-medium">Net Payable</span>
                            <span className="text-xl font-bold text-primary">₹{payout.netPayable}</span>
                          </div>
                        </div>

                        {/* Due Date */}
                        {payout.dueDate && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(payout.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Status Badge */}
                        <Badge className={statusConfig[payout.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[payout.status].label}
                        </Badge>

                        {payout.status === 'PAID' && payout.paidAt && (
                          <p className="text-xs text-muted-foreground">
                            Paid on {new Date(payout.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
