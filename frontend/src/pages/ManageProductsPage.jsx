import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Badge } from 'components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from 'components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from 'components/ui/alert-dialog';
import { useAuth } from 'context/AuthContext';
import { productAPI } from 'services/api';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const ManageProductsPage = () => {
  const { isSeller } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isSeller) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchProducts();
  }, [isSeller, navigate]);

  const fetchProducts = async () => {
    try {
      const data = await productAPI.getSellerProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      stockQuantity: product.stockQuantity
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await productAPI.update(editingProduct.id, editingProduct);
      toast.success('Product updated successfully');
      setShowEditDialog(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await productAPI.delete(productToDelete.id);
      toast.success('Product deleted successfully');
      setShowDeleteDialog(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
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
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-4xl font-semibold mb-2">Manage Products</h1>
            <p className="text-muted-foreground">View and manage your product listings</p>
          </div>
          <Button onClick={() => navigate('/seller/story-studio')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-semibold mb-2">No Products Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start creating your first product in Story Studio
            </p>
            <Button onClick={() => navigate('/seller/story-studio')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Package className="w-12 h-12 text-primary/40" />
                  </div>

                  <div className="p-6">
                    {/* Product Name & Price */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-semibold mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          ₹{product.basePrice}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Stock</p>
                          <p className="font-medium">{product.stockQuantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sold</p>
                          <p className="font-medium">0</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {product.stockQuantity < 10 && (
                      <div className="flex items-center gap-2 mb-4 p-2 rounded bg-orange-500/10">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          Low stock warning
                        </span>
                      </div>
                    )}

                    {/* Batch Info */}
                    <div className="space-y-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        Batch: {product.batchNumber}
                      </Badge>
                      {product.manufacturingDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Mfg: {new Date(product.manufacturingDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDelete(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  className="w-full p-3 border border-border rounded-md bg-background"
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={(e) => setEditingProduct({...editingProduct, basePrice: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
