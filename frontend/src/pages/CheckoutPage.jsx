import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Separator } from 'components/ui/separator';
import { RadioGroup, RadioGroupItem } from 'components/ui/radio-group';
import { useAuth } from 'context/AuthContext';
import { cartAPI, orderAPI } from 'services/api';
import { toast } from 'sonner';
import { 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle2,
  Loader2,
  Plus
} from 'lucide-react';

export const CheckoutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  
  // Address state
  const [addresses, setAddresses] = useState([
    {
      id: 'addr1',
      addressLine1: '123 Main Street',
      addressLine2: 'Near Central Park',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
      isDefault: true
    }
  ]);
  const [selectedAddress, setSelectedAddress] = useState('addr1');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/cart');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartAPI.get();
      if (!data.cart || data.cart.length === 0) {
        navigate('/cart');
        return;
      }
      setCart(data.cart);
    } catch (error) {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const addNewAddress = () => {
    if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    const addr = {
      id: `addr${addresses.length + 1}`,
      ...newAddress,
      isDefault: addresses.length === 0
    };

    setAddresses([...addresses, addr]);
    setSelectedAddress(addr.id);
    setShowAddressForm(false);
    setNewAddress({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
    toast.success('Address added');
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setPlacing(true);
    try {
      const selectedAddrObj = addresses.find(a => a.id === selectedAddress);
      // Pass the complete address object instead of a fake ID
      const response = await orderAPI.create(selectedAddrObj);
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.orders[0].id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.productVariant?.product?.basePrice || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
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
          <h1 className="font-serif text-4xl font-semibold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    step >= s.num 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`hidden sm:block ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                    step > s.num ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="font-serif text-xl font-semibold">Delivery Address</h2>
                  </div>

                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAddress === addr.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedAddress(addr.id)}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={addr.id} id={addr.id} />
                            <div className="flex-1">
                              <Label htmlFor={addr.id} className="cursor-pointer">
                                <div className="font-medium mb-1">
                                  {addr.addressLine1}
                                  {addr.isDefault && (
                                    <Badge variant="secondary" className="ml-2">Default</Badge>
                                  )}
                                </div>
                                {addr.addressLine2 && (
                                  <p className="text-sm text-muted-foreground">{addr.addressLine2}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                {addr.phone && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Phone: {addr.phone}
                                  </p>
                                )}
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Add New Address Form */}
                  {showAddressForm ? (
                    <div className="mt-6 p-4 border border-border rounded-lg">
                      <h3 className="font-medium mb-4">Add New Address</h3>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="line1">Address Line 1 *</Label>
                          <Input
                            id="line1"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                            placeholder="Street address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="line2">Address Line 2</Label>
                          <Input
                            id="line2"
                            value={newAddress.addressLine2}
                            onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              value={newAddress.pincode}
                              onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={addNewAddress}>Save Address</Button>
                          <Button variant="outline" onClick={() => setShowAddressForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setShowAddressForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Address
                    </Button>
                  )}

                  <Button
                    size="lg"
                    className="w-full mt-6"
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                  >
                    Continue to Payment
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h2 className="font-serif text-xl font-semibold">Payment Method</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'COD' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('COD')}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="COD" id="cod" />
                          <Label htmlFor="cod" className="cursor-pointer flex-1">
                            <div className="font-medium mb-1">Cash on Delivery</div>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </Label>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'UPI' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('UPI')}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="UPI" id="upi" />
                          <Label htmlFor="upi" className="cursor-pointer flex-1">
                            <div className="font-medium mb-1">UPI Payment</div>
                            <p className="text-sm text-muted-foreground">
                              GooglePay, PhonePe, Paytm & more
                            </p>
                          </Label>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          paymentMethod === 'CARD' 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('CARD')}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value="CARD" id="card" />
                          <Label htmlFor="card" className="cursor-pointer flex-1">
                            <div className="font-medium mb-1">Credit / Debit Card</div>
                            <p className="text-sm text-muted-foreground">
                              Visa, Mastercard, Rupay
                            </p>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button size="lg" className="flex-1" onClick={() => setStep(3)}>
                      Review Order
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Review & Place Order */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Delivery Address Summary */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">Delivery Address</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      Change
                    </Button>
                  </div>
                  {addresses.find(a => a.id === selectedAddress) && (
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const addr = addresses.find(a => a.id === selectedAddress);
                        return (
                          <>
                            <p>{addr.addressLine1}</p>
                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </Card>

                {/* Payment Method Summary */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-medium">Payment Method</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                      Change
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === 'COD' && 'Cash on Delivery'}
                    {paymentMethod === 'UPI' && 'UPI Payment'}
                    {paymentMethod === 'CARD' && 'Credit / Debit Card'}
                  </p>
                </Card>

                {/* Order Items */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Order Items ({cart.length})</h3>
                  </div>
                  <div className="space-y-4">
                    {cart.map((item, idx) => {
                      const product = item.productVariant?.product;
                      const price = product?.basePrice || 0;
                      return (
                        <div key={item.id}>
                          {idx > 0 && <Separator className="my-4" />}
                          <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop`}
                                alt={product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium line-clamp-1">{product?.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">₹{(price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({cart.length})</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary">FREE</Badge>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <p>Secure checkout</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <p>Direct from Himalayan artisans</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <p>Authenticity guaranteed with timeline tracking</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
