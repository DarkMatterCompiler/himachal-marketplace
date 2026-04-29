import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useAuth } from 'context/AuthContext';
import { toast } from 'sonner';
import {
  TrendingUp,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';

const categories = [
  { id: 'cat1', name: 'Organic Skincare' },
  { id: 'cat2', name: 'Organic Food' },
  { id: 'cat3', name: 'Traditional Textiles' },
  { id: 'cat4', name: 'Artisan Crafts' }
];

export const CommissionManagementPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [commissionRules, setCommissionRules] = useState([
    { categoryId: 'cat1', categoryName: 'Organic Skincare', percentageFee: 8, fixedFee: 15 },
    { categoryId: 'cat2', categoryName: 'Organic Food', percentageFee: 8, fixedFee: 15 },
    { categoryId: 'cat3', categoryName: 'Traditional Textiles', percentageFee: 10, fixedFee: 20 },
    { categoryId: 'cat4', categoryName: 'Artisan Crafts', percentageFee: 12, fixedFee: 25 }
  ]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
  }, [isAdmin, navigate]);

  const handleUpdate = (categoryId, field, value) => {
    setCommissionRules(rules =>
      rules.map(rule =>
        rule.categoryId === categoryId
          ? { ...rule, [field]: parseFloat(value) || 0 }
          : rule
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save commission rules
      // await adminAPI.updateCommissionRules(commissionRules);
      toast.success('Commission rules updated successfully');
    } catch (error) {
      toast.error('Failed to update commission rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Commission Management</h1>
          <p className="text-muted-foreground">
            Edit category-wise commission rules
          </p>
        </motion.div>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">How Commission Works</p>
              <p>Commission = (Order Amount × Percentage Fee%) + Fixed Fee per item</p>
              <p className="mt-2">Example: For a ₹1000 order with 2 items at 10% + ₹20/item:</p>
              <p>Commission = (₹1000 × 10%) + (₹20 × 2) = ₹100 + ₹40 = ₹140</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {commissionRules.map((rule, index) => (
            <motion.div
              key={rule.categoryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{rule.categoryName}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`percent-${rule.categoryId}`}>Percentage Fee (%)</Label>
                    <Input
                      id={`percent-${rule.categoryId}`}
                      type="number"
                      step="0.1"
                      value={rule.percentageFee}
                      onChange={(e) => handleUpdate(rule.categoryId, 'percentageFee', e.target.value)}
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`fixed-${rule.categoryId}`}>Fixed Fee per Item (₹)</Label>
                    <Input
                      id={`fixed-${rule.categoryId}`}
                      type="number"
                      value={rule.fixedFee}
                      onChange={(e) => handleUpdate(rule.categoryId, 'fixedFee', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Example: ₹1000 order with 2 items = <span className="font-medium text-foreground">
                      ₹{((1000 * rule.percentageFee / 100) + (rule.fixedFee * 2)).toFixed(2)} commission
                    </span>
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <Button onClick={handleSave} disabled={loading} size="lg" className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
