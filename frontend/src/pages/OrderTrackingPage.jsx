import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Separator } from 'components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { useAuth } from 'context/AuthContext';
import { orderAPI } from 'services/api';
import { toast } from 'sonner';
import { 
  Package, 
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/?auth=login');
      return;
    }
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, isAuthenticated, navigate]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getById(orderId);
      setOrder(data || null);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const openTimeline = (variant) => {
    setSelectedTimeline(variant);
    setTimelineOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Order not found</p>
            <Link to="/orders">
              <Button className="mt-4">Back to Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderSteps = [
    { status: 'PENDING_CONFIRMATION', label: 'Order Placed', icon: Clock },
    { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { status: 'PROCESSING', label: 'Processing', icon: Package },
    { status: 'SHIPPED', label: 'Shipped', icon: Truck },
    { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = orderSteps.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Back Button */}
        <Link to="/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl font-semibold mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-2xl">₹{order.totalAmount.toLocaleString()}</p>
              <Badge className="mt-2">{order.paymentMethod}</Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-8">Order Status</h2>
                
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  <div 
                    className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
                    style={{ height: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
                  />

                  {/* Steps */}
                  <div className="relative space-y-8">
                    {orderSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.status} className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 pt-2">
                            <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                              {step.label}
                            </p>
                            {isCompleted && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(order.createdAt).toLocaleDateString('en-IN')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Order Items with Authenticity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-6">Order Items</h2>
                
                <div className="space-y-6">
                  {order.orderItems?.map((item, idx) => {
                    const product = item.productVariant?.product;
                    const variant = item.productVariant;
                    const timeline = variant?.authenticitySteps || [];

                    return (
                      <div key={item.id}>
                        {idx > 0 && <Separator className="my-6" />}
                        
                        <div className="flex gap-4 mb-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop`}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{product?.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Qty: {item.quantity} × ₹{item.unitPrice?.toLocaleString()}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="secondary">Batch: {item.productVariant?.batchNumber}</Badge>
                              {product?.seller && (
                                <Badge variant="outline">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {product.seller.locationVillage}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="font-semibold">
                            ₹{item.lineTotal?.toLocaleString() || (item.unitPrice * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Minimal Timeline Preview */}
                        {timeline.length > 0 && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <p className="text-sm font-medium">
                                  Authenticity Timeline ({timeline.length} steps verified)
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openTimeline(variant)}
                              >
                                View Full Journey
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>

                            {/* Mini Timeline */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {timeline.slice(0, 4).map((step, stepIdx) => (
                                <div
                                  key={stepIdx}
                                  className="flex-shrink-0 w-32 p-2 bg-background rounded border border-border"
                                >
                                  <p className="text-xs font-medium line-clamp-1 mb-1">
                                    {step.stepName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(step.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </p>
                                </div>
                              ))}
                              {timeline.length > 4 && (
                                <div className="flex-shrink-0 w-32 p-2 bg-background rounded border border-border flex items-center justify-center">
                                  <p className="text-xs text-muted-foreground">
                                    +{timeline.length - 4} more
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Delivery Address</h3>
                </div>
                {order.shippingAddress && (
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p>{order.shippingAddress.pincode}</p>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Shipment Details */}
            {order.shipment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Shipment</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge>{order.shipment.status}</Badge>
                    </div>
                    {order.shipment.trackingNumber && (
                      <div>
                        <p className="text-muted-foreground mb-1">Tracking Number</p>
                        <p className="font-medium">{order.shipment.trackingNumber}</p>
                      </div>
                    )}
                    {order.shipment.estimatedDelivery && (
                      <div>
                        <p className="text-muted-foreground mb-1">
                          {order.status === 'DELIVERED' ? 'Delivered On' : 'Expected Delivery'}
                        </p>
                        <p className="font-medium">
                          {new Date(
                            order.shipment.actualDelivery || order.shipment.estimatedDelivery
                          ).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Seller Contact */}
            {order.orderItems?.[0]?.productVariant?.product?.seller && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Seller Details</h3>
                  </div>
                  {(() => {
                    const seller = order.orderItems[0].productVariant.product.seller;
                    return (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Location</p>
                          <p className="font-medium">{seller.locationVillage}</p>
                        </div>
                        {seller.user?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{seller.user.email}</p>
                          </div>
                        )}
                        {seller.user?.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{seller.user.phoneNumber}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Authenticity Timeline Modal */}
        <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                Product Journey: {selectedTimeline?.product?.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Batch: {selectedTimeline?.batchNumber}
              </p>
            </DialogHeader>

            {selectedTimeline?.authenticitySteps && (
              <div className="mt-6">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />

                  {/* Timeline Steps */}
                  <div className="space-y-8">
                    {selectedTimeline.authenticitySteps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-6"
                      >
                        {/* Timeline Dot */}
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 z-10">
                          <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-8">
                          <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="font-serif text-lg font-semibold mb-2">
                              {step.stepName}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {step.description}
                            </p>

                            {/* Image */}
                            {step.imageUrl && (
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <img
                                  src={step.imageUrl}
                                  alt={step.stepName}
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(step.timestamp).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {step.locationLatLong && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <a
                                    href={`https://www.google.com/maps?q=${step.locationLatLong}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors"
                                  >
                                    View on Map
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
