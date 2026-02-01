import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { products } from 'data/products';
import { useTheme } from 'context/ThemeContext';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  ShoppingBag,
  Star,
  Shield,
  Leaf,
  Award,
  MapPin,
  User,
  ChevronRight,
  Check
} from 'lucide-react';

// Icon mapping for journey steps
const journeyIcons = {
  flower: '🌹',
  flask: '🧪',
  beaker: '⚗️',
  check: '✓',
  package: '📦',
  bee: '🐝',
  filter: '🔍',
  microscope: '🔬',
  bottle: '🍯',
  sheep: '🐑',
  spinning: '🧵',
  palette: '🎨',
  loom: '🪡',
  scissors: '✂️',
  tree: '🌲',
  chisel: '🔨',
  paintbrush: '🖌️',
  steam: '💨',
  vial: '🧴',
  droplet: '💧',
  bamboo: '🎍',
  hands: '🤲',
  weave: '🪢',
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('journey');

  // Find the product
  const product = products.find(p => p.id === parseInt(id)) || products[0];

  // Mock additional images
  const productImages = [
    product.image,
    product.image.replace('w=600', 'w=601'),
    product.image.replace('w=600', 'w=602'),
  ];

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to="/products">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
          </Link>
        </motion.div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Side - Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {product.badge && (
                  <Badge className="bg-primary text-primary-foreground">
                    {product.badge}
                  </Badge>
                )}
                {product.certified && (
                  <Badge className="bg-secondary text-secondary-foreground">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Origin
                  </Badge>
                )}
              </div>

              {/* Wishlist & Share */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-colors hover:bg-card"
                >
                  <Heart 
                    className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : 'text-foreground'}`} 
                  />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-colors hover:bg-card"
                >
                  <Share2 className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3">
              {productImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index 
                      ? 'border-primary' 
                      : 'border-transparent'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category */}
            <p className="text-sm uppercase tracking-wider text-primary font-medium mb-3">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-foreground italic mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold text-3xl text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-primary border-primary">
                    Save {discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Origin Info */}
            <Card variant="glass" className="p-5 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-medium text-foreground">{product.origin}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Artisan</p>
                  <p className="font-medium text-foreground">{product.artisan}</p>
                </div>
              </div>
            </Card>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6 mb-8">
              <p className="font-medium text-foreground">Quantity</p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart - Sticky Pill Button */}
            <div className="flex gap-4 mb-8">
              <Button 
                variant="hero" 
                size="pill" 
                className="flex-1 gap-2 text-base h-14"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart — ₹{(product.price * quantity).toLocaleString()}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-secondary" />
                Authenticity Guaranteed
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Leaf className="w-4 h-4 text-olive" />
                Eco-friendly Packaging
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4 text-accent" />
                GI Certified
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section - Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-border mb-8">
            {['journey', 'ingredients', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'journey' ? 'Supply Chain Journey' : tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'journey' && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant={theme === 'dark' ? 'glass' : 'elevated'} className="p-8 lg:p-10">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-8">
                    From Source to Your Doorstep
                  </h3>
                  
                  {/* Timeline */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div 
                      className={`absolute left-6 top-0 bottom-0 w-0.5 ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-b from-burgundy-glow via-burgundy to-burgundy-red glow-line' 
                          : 'bg-gradient-to-b from-olive via-golden to-rose'
                      }`}
                    />
                    
                    {/* Timeline Steps */}
                    <div className="space-y-8">
                      {product.journey.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-6 pl-16"
                        >
                          {/* Timeline Dot */}
                          <div 
                            className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                              theme === 'dark'
                                ? 'bg-burgundy/20 border-2 border-burgundy-glow shadow-glow-burgundy'
                                : 'bg-primary/10 border-2 border-primary'
                            }`}
                          >
                            {journeyIcons[step.icon] || <Check className="w-5 h-5" />}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 pb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-foreground text-lg">
                                {step.step}
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {step.date}
                              </span>
                            </div>
                            <p className="text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {step.location}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'ingredients' && (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated" className="p-8">
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Natural Ingredients
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {product.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-2xl bg-muted/50 text-center"
                      >
                        <Leaf className="w-6 h-6 mx-auto mb-2 text-olive" />
                        <p className="font-medium text-foreground">{ingredient}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated" className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-2xl font-semibold text-foreground">
                      Customer Reviews
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">{product.rating}</span>
                      <span className="text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Reviews will appear here. This is a prototype demonstration.</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

