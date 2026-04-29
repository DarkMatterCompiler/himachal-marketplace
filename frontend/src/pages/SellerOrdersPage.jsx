import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui/select';
import { useAuth } from 'context/AuthContext';
import { orderAPI } from 'services/api';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  Loader2,
  Eye,
  MapPin
} from 'lucide-react';

const statusConfig = {
  PENDING_CONFIRMATION: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  CONFIRMED: { label: 'Confirmed', icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-600 dark:text-red-400' }
};

const nextStatusMap = {
  PENDING_CONFIRMATION: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED'
};

export const SellerOrdersPage = () => {
  const { isSeller } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (!isSeller) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchOrders();
  }, [isSeller, navigate]);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filter));
    }
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getSellerOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Manage orders containing your products
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status === 'ALL' ? 'All Orders' : statusConfig[status].label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-muted-foreground">
              {filter === 'ALL' ? 'You have no orders yet' : `No orders with status: ${statusConfig[filter].label}`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon;
              const canUpdateStatus = nextStatusMap[order.status] && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

              return (
                <motion.div
                  key={order.id}
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
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.items?.length} item(s) • Customer: {order.user?.email || 'N/A'}
                          </p>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mb-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                          </div>
                        )}

                        {/* Shipment Info */}
                        {order.shipment && (
                          <div className="flex flex-wrap gap-4 text-sm">
                            {order.shipment.trackingNumber && (
                              <div>
                                <span className="text-muted-foreground">Tracking: </span>
                                <span className="font-medium">{order.shipment.trackingNumber}</span>
                              </div>
                            )}
                            {order.shipment.estimatedDeliveryDate && (
                              <div>
                                <span className="text-muted-foreground">Est. Delivery: </span>
                                <span className="font-medium">
                                  {new Date(order.shipment.estimatedDeliveryDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Status Badge */}
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>

                        {/* Amount */}
                        <p className="text-2xl font-bold">₹{order.totalAmount}</p>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {canUpdateStatus && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, nextStatusMap[order.status])}
                              disabled={updatingOrderId === order.id}
                            >
                              {updatingOrderId === order.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  Update to {statusConfig[nextStatusMap[order.status]].label}
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/seller/orders/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </div>
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
