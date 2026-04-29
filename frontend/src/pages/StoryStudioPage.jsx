import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'components/ui/button';
import { Card } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import { Badge } from 'components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { useAuth } from 'context/AuthContext';
import { productAPI } from 'services/api';
import { toast } from 'sonner';
import { 
  Package, 
  Image as ImageIcon,
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Upload
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Product Info', icon: Package },
  { id: 2, title: 'Batch Details', icon: Calendar },
  { id: 3, title: 'Timeline Steps', icon: MapPin },
  { id: 4, title: 'Preview', icon: CheckCircle2 }
];

const categories = [
  { id: 'Organic Skincare', name: 'Organic Skincare' },
  { id: 'Organic Food', name: 'Organic Food' },
  { id: 'Traditional Textiles', name: 'Traditional Textiles' },
  { id: 'Artisan Crafts', name: 'Artisan Crafts' }
];

export const StoryStudioPage = () => {
  const { isSeller } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Product Info (Step 1)
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    tags: ''
  });

  // Batch Details (Step 2)
  const [batchData, setBatchData] = useState({
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    stockQuantity: '',
    isPerishable: false,
    sku: ''
  });

  // Timeline Steps (Step 3)
  const [timelineSteps, setTimelineSteps] = useState([
    {
      stepName: '',
      description: '',
      imageUrl: '',
      timestamp: '',
      locationLatLong: ''
    }
  ]);

  const addTimelineStep = () => {
    setTimelineSteps([
      ...timelineSteps,
      {
        stepName: '',
        description: '',
        imageUrl: '',
        timestamp: '',
        locationLatLong: ''
      }
    ]);
  };

  const removeTimelineStep = (index) => {
    if (timelineSteps.length > 1) {
      setTimelineSteps(timelineSteps.filter((_, i) => i !== index));
    }
  };

  const updateTimelineStep = (index, field, value) => {
    const updated = [...timelineSteps];
    updated[index][field] = value;
    setTimelineSteps(updated);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!productData.name || !productData.description || !productData.basePrice || !productData.categoryId) {
          toast.error('Please fill all required fields');
          return false;
        }
        return true;
      case 2:
        if (!batchData.batchNumber || !batchData.manufacturingDate || !batchData.stockQuantity || !batchData.sku) {
          toast.error('Please fill all required batch fields');
          return false;
        }
        return true;
      case 3:
        const hasEmptySteps = timelineSteps.some(s => !s.stepName || !s.description || !s.timestamp);
        if (hasEmptySteps) {
          toast.error('Please complete all timeline steps');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...productData,
        basePrice: parseFloat(productData.basePrice),
        ...batchData,
        stockQuantity: parseInt(batchData.stockQuantity),
        authenticitySteps: timelineSteps
      };

      await productAPI.create(payload);
      toast.success('Product created successfully!');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  if (!isSeller) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Story Studio</h1>
          <p className="text-muted-foreground">
            Create a new product with its unique story and timeline
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-primary text-primary-foreground' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      isCurrent ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Product Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Product Information</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productData.name}
                      onChange={(e) => setProductData({...productData, name: e.target.value})}
                      placeholder="e.g., Himalayan Rose Serum"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) => setProductData({...productData, description: e.target.value})}
                      placeholder="Tell the story of your product..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Base Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={productData.basePrice}
                        onChange={(e) => setProductData({...productData, basePrice: e.target.value})}
                        placeholder="899"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={productData.categoryId}
                        onValueChange={(value) => setProductData({...productData, categoryId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={productData.tags}
                      onChange={(e) => setProductData({...productData, tags: e.target.value})}
                      placeholder="organic, handmade, natural"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Batch Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Batch Details</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batchNumber">Batch Number *</Label>
                      <Input
                        id="batchNumber"
                        value={batchData.batchNumber}
                        onChange={(e) => setBatchData({...batchData, batchNumber: e.target.value})}
                        placeholder="ROSE-2026-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={batchData.sku}
                        onChange={(e) => setBatchData({...batchData, sku: e.target.value})}
                        placeholder="SKU-ROSE-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mfgDate">Manufacturing Date *</Label>
                      <Input
                        id="mfgDate"
                        type="date"
                        value={batchData.manufacturingDate}
                        onChange={(e) => setBatchData({...batchData, manufacturingDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expDate">Expiry Date</Label>
                      <Input
                        id="expDate"
                        type="date"
                        value={batchData.expiryDate}
                        onChange={(e) => setBatchData({...batchData, expiryDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={batchData.stockQuantity}
                      onChange={(e) => setBatchData({...batchData, stockQuantity: e.target.value})}
                      placeholder="100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="perishable"
                      checked={batchData.isPerishable}
                      onChange={(e) => setBatchData({...batchData, isPerishable: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="perishable" className="cursor-pointer">
                      This is a perishable item
                    </Label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Timeline Steps */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-semibold">Authenticity Timeline</h2>
                  <Button onClick={addTimelineStep} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-6">
                  {timelineSteps.map((step, index) => (
                    <Card key={index} className="p-6 border-2 border-border">
                      <div className="flex items-start justify-between mb-4">
                        <Badge>Step {index + 1}</Badge>
                        {timelineSteps.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimelineStep(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Step Name *</Label>
                          <Input
                            value={step.stepName}
                            onChange={(e) => updateTimelineStep(index, 'stepName', e.target.value)}
                            placeholder="e.g., Rose Harvest"
                          />
                        </div>

                        <div>
                          <Label>Description *</Label>
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateTimelineStep(index, 'description', e.target.value)}
                            placeholder="Describe this step in the process..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Image URL</Label>
                            <Input
                              value={step.imageUrl}
                              onChange={(e) => updateTimelineStep(index, 'imageUrl', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <Label>Date & Time *</Label>
                            <Input
                              type="datetime-local"
                              value={step.timestamp}
                              onChange={(e) => updateTimelineStep(index, 'timestamp', e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Location (Lat, Long)</Label>
                          <Input
                            value={step.locationLatLong}
                            onChange={(e) => updateTimelineStep(index, 'locationLatLong', e.target.value)}
                            placeholder="31.1048,77.1734"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Optional: Add GPS coordinates for map tracking
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Preview & Confirm</h2>
                
                <div className="space-y-6">
                  {/* Product Info Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Product Information</h3>
                    <Card className="p-4">
                      <p className="font-serif text-xl mb-2">{productData.name}</p>
                      <p className="text-sm text-muted-foreground mb-3">{productData.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-medium">₹{productData.basePrice}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category: </span>
                          <span className="font-medium">
                            {categories.find(c => c.id === productData.categoryId)?.name}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Batch Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Batch Details</h3>
                    <Card className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Batch: </span>
                          <span className="font-medium">{batchData.batchNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stock: </span>
                          <span className="font-medium">{batchData.stockQuantity} units</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mfg Date: </span>
                          <span className="font-medium">
                            {new Date(batchData.manufacturingDate).toLocaleDateString()}
                          </span>
                        </div>
                        {batchData.expiryDate && (
                          <div>
                            <span className="text-muted-foreground">Expiry: </span>
                            <span className="font-medium">
                              {new Date(batchData.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Timeline Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Authenticity Timeline ({timelineSteps.length} steps)</h3>
                    <div className="space-y-2">
                      {timelineSteps.map((step, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-primary">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium mb-1">{step.stepName}</p>
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
