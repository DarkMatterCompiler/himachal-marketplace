import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CategoryCard = ({ category, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link 
        to={`/category/${category.id}`}
        className="group block relative"
      >
        <div className="relative aspect-square overflow-hidden rounded-3xl">
          {/* Image */}
          <motion.img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="space-y-2">
              <h3 className="font-serif text-xl lg:text-2xl font-semibold text-card-foreground dark:text-card">
                {category.name}
              </h3>
              <p className="text-sm text-card-foreground/80 dark:text-card/80">
                {category.description}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-card-foreground/70 dark:text-card/70">
                  {category.count} products
                </span>
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-card/30 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-card-foreground dark:text-card" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

