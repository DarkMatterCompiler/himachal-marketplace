import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Input } from 'components/ui/input';
import { Separator } from 'components/ui/separator';
import { useAuth } from 'context/AuthContext';
import { cartAPI } from 'services/api';
import { toast } from 'sonner';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  Loader2
} from 'lucide-react';

export const CartPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.get();
      setCart(data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    try {
      await cartAPI.update(itemId, newQuantity);
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success('Cart updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setCart([]);
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  // Group cart items by seller
  const groupedCart = cart.reduce((acc, item) => {
    const sellerId = item.productVariant?.product?.seller?.id || 'unknown';
    if (!acc[sellerId]) {
      acc[sellerId] = {
        seller: item.productVariant?.product?.seller,
        items: []
      };
    }
    acc[sellerId].items.push(item);
    return acc;
  }, {});

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.productVariant?.product?.basePrice || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-serif text-3xl font-semibold mb-4">Sign in to view your cart</h1>
            <p className="text-muted-foreground mb-8">
              Please log in to add items to your cart and checkout
            </p>
            <Button onClick={() => navigate('/?auth=login')} size="lg">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="font-serif text-3xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link to="/products">
              <Button size="lg">
                Start Shopping
              </Button>
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedCart).map(([sellerId, group], groupIndex) => (
              <motion.div
                key={sellerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <Card className="p-6">
                  {/* Seller Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        Sold by {group.seller?.user?.email?.split('@')[0] || 'Unknown Seller'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {group.seller?.locationVillage || 'Himachal Pradesh'}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    {group.items.map((item, itemIndex) => {
                      const product = item.productVariant?.product;
                      const variant = item.productVariant;
                      const price = product?.basePrice || 0;
                      const itemTotal = price * item.quantity;

                      return (
                        <div key={item.id}>
                          {itemIndex > 0 && <Separator className="my-4" />}
                          
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop`}
                                alt={product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <Link to={`/product/${product?.id}`}>
                                <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                                  {product?.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">
                                Batch: {variant?.batchNumber}
                              </p>
                              {variant?.isPerishable && variant?.expiryDate && (
                                <Badge variant="secondary" className="mt-2">
                                  Expires: {new Date(variant.expiryDate).toLocaleDateString()}
                                </Badge>
                              )}

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 border border-border rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={updating[item.id] || item.quantity <= 1}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-12 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={updating[item.id] || item.quantity >= variant?.stockQuantity}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="font-semibold text-lg">
                                ₹{itemTotal.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ₹{price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Clear Cart Button */}
            <Button
              variant="ghost"
              onClick={clearCart}
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Free shipping on orders above ₹1,000
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">We accept</p>
                <div className="flex gap-2">
                  <Badge variant="outline">COD</Badge>
                  <Badge variant="outline">UPI</Badge>
                  <Badge variant="outline">Cards</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
