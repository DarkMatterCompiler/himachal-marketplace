import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { useAuth } from 'context/AuthContext';
import { toast } from 'sonner';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Loader2,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    pendingPayouts: 0,
    platformCommission: 0
  });

  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingPayouts, setPendingPayouts] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Access denied - Admin only');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Mock data - will be replaced with API calls
      setStats({
        totalUsers: 1247,
        totalSellers: 89,
        totalOrders: 3421,
        totalRevenue: 1245000,
        pendingVerifications: 12,
        pendingPayouts: 34,
        platformCommission: 124500
      });

      setPendingSellers([
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          location: 'Manali',
          sellerType: 'ARTISAN',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          location: 'Shimla',
          sellerType: 'FARMER',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ]);

      setPendingPayouts([
        {
          id: '1',
          sellerName: 'Mountain Crafts',
          amount: 25000,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          sellerName: 'Himalayan Herbs',
          amount: 18500,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and management
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sellers</p>
                  <p className="text-2xl font-bold">{stats.totalSellers}</p>
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
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
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
                  <p className="text-2xl font-bold">₹{(stats.platformCommission / 1000).toFixed(0)}K</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Pending Seller Verifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Pending Verifications</h2>
                    <p className="text-sm text-muted-foreground">{stats.pendingVerifications} sellers waiting</p>
                  </div>
                </div>
                <Link to="/admin/seller-verification">
                  <Button size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {pendingSellers.map((seller) => (
                  <Card key={seller.id} className="p-4 bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{seller.sellerType}</Badge>
                          <span className="text-xs text-muted-foreground">
                            • {seller.location}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((Date.now() - seller.submittedAt) / (1000 * 60 * 60 * 24))}d ago
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Pending Payouts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Pending Payouts</h2>
                    <p className="text-sm text-muted-foreground">{stats.pendingPayouts} payments due</p>
                  </div>
                </div>
                <Link to="/admin/payout-approval">
                  <Button size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {pendingPayouts.map((payout) => (
                  <Card key={payout.id} className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payout.sellerName}</p>
                        <p className="text-xl font-bold text-primary mt-1">₹{payout.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Due in {Math.ceil((payout.dueDate - Date.now()) / (1000 * 60 * 60 * 24))}d
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/admin/seller-verification">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Seller Verification</p>
                      <p className="text-xs text-muted-foreground">Review pending applications</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link to="/admin/commission-management">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Commission Management</p>
                      <p className="text-xs text-muted-foreground">Edit category commission rules</p>
                    </div>
                  </div>
                </Button>
              </Link>

              <Link to="/admin/payout-approval">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Payout Approval</p>
                      <p className="text-xs text-muted-foreground">Approve pending payouts</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
