import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from 'components/ui/card';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';

export const ProductCard = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card 
        variant="product"
        className="h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          
          {/* Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent"
          />

          {/* Badge */}
          {product.badge && (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground font-medium px-3 py-1">
              {product.badge}
            </Badge>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-medium px-3 py-1">
              -{discount}%
            </Badge>
          )}

          {/* Wishlist Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-colors hover:bg-card"
            style={{ display: product.badge ? 'none' : 'flex' }}
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-primary text-primary' : 'text-foreground'}`} 
            />
          </motion.button>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            <Button 
              variant="glass" 
              size="sm" 
              className="flex-1 bg-card/90 backdrop-blur-sm"
            >
              <ShoppingBag className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
            <Link to={`/product/${product.id}`}>
              <Button 
                variant="glass" 
                size="icon" 
                className="bg-card/90 backdrop-blur-sm h-8 w-8"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {product.category}
          </p>
          
          {/* Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-border'}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg text-foreground">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Origin */}
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
            {product.origin}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

