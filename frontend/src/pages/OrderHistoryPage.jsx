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
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  ShoppingBag
} from 'lucide-react';

const statusConfig = {
  PENDING_CONFIRMATION: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-600' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-purple-600' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-indigo-600' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' }
};

export const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, delivered, cancelled

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?auth=login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status);
    if (filter === 'delivered') return order.status === 'DELIVERED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-serif text-3xl font-semibold mb-4">No orders yet</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't placed any orders
            </p>
            <Link to="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Order History</h1>
          <p className="text-muted-foreground">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? 'default' : 'outline'}
              onClick={() => setFilter(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order, index) => {
            const StatusIcon = statusConfig[order.status]?.icon || Clock;
            const statusColor = statusConfig[order.status]?.color || 'text-muted-foreground';
            const statusLabel = statusConfig[order.status]?.label || order.status;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                        <Badge variant="outline" className={statusColor}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-6">
                    {order.orderItems?.slice(0, 3).map((item) => {
                      const product = item.productVariant?.product;
                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop`}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">{product?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.unitPrice}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Batch: {item.productVariant?.batchNumber}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {order.orderItems?.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{order.orderItems.length - 3} more items
                      </p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                        <br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  )}

                  {/* Shipment Info */}
                  {order.shipment && (
                    <div className="mb-6 p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium mb-1">Shipment Status</p>
                          <p className="text-sm text-muted-foreground">{order.shipment.status}</p>
                        </div>
                        {order.shipment.trackingNumber && (
                          <Badge variant="secondary">
                            {order.shipment.trackingNumber}
                          </Badge>
                        )}
                      </div>
                      {order.shipment.estimatedDelivery && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {order.status === 'DELIVERED' ? 'Delivered' : 'Expected delivery'}: {' '}
                          {new Date(order.shipment.actualDelivery || order.shipment.estimatedDelivery).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link to={`/orders/${order.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" className="flex-1">
                        Write Review
                      </Button>
                    )}
                    {['PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status) && (
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders found with selected filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
