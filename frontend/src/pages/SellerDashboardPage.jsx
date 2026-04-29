import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { useAuth } from 'context/AuthContext';
import { orderAPI } from 'services/api';
import { toast } from 'sonner';
import { 
  Package, 
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Loader2,
  ArrowUpRight
} from 'lucide-react';

export const SellerDashboardPage = () => {
  const { user, isSeller } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!isSeller) {
      navigate('/');
      toast.error('Seller access required');
      return;
    }
    fetchDashboardData();
  }, [isSeller, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const orders = await orderAPI.getSellerOrders();
      
      // Calculate stats
      const total = orders.length;
      const pending = orders.filter(o => 
        ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING'].includes(o.status)
      ).length;
      
      const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      const currentMonth = new Date().getMonth();
      const monthlyRev = orders
        .filter(o => new Date(o.createdAt).getMonth() === currentMonth)
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        totalOrders: total,
        pendingOrders: pending,
        totalRevenue: revenue,
        monthlyRevenue: monthlyRev
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      label: 'This Month',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-semibold mb-2">Seller Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.email?.split('@')[0]}!
              </p>
            </div>
            <Link to="/seller/story-studio">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl font-semibold">Recent Orders</h2>
                  <Link to="/seller/orders">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-1">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              {order.orderItems?.length} items • {order.user?.email}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant={
                                order.status === 'DELIVERED' ? 'default' :
                                order.status === 'CANCELLED' ? 'destructive' :
                                'secondary'
                              }>
                                {order.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold mb-2">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                          <Link to={`/seller/orders/${order.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/seller/story-studio">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </Link>
                  <Link to="/seller/products">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="w-4 h-4 mr-2" />
                      Manage Products
                    </Button>
                  </Link>
                  <Link to="/seller/orders">
                    <Button variant="outline" className="w-full justify-start">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View Orders
                    </Button>
                  </Link>
                  <Link to="/seller/payouts">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      View Payouts
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Tips Card */}
              <Card className="p-6 mt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Pro Tip</h3>
                    <p className="text-sm text-muted-foreground">
                      Add authenticity timeline steps to your products to build trust with buyers
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
