import { useState, useEffect } from 'react';
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
import { sellerAPI } from 'services/api';
import { toast } from 'sonner';
import {
  UserCircle,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  MapPin
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Profile', icon: UserCircle },
  { id: 2, title: 'Bank Details', icon: CreditCard },
  { id: 3, title: 'Verification', icon: CheckCircle2 }
];

const sellerTypes = [
  { value: 'ARTISAN', label: 'Artisan' },
  { value: 'FARMER', label: 'Farmer' },
  { value: 'PRODUCER', label: 'Producer' },
  { value: 'COOPERATIVE', label: 'Cooperative' }
];

export const SellerOnboardingPage = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // Profile Data (Step 1)
  const [profileData, setProfileData] = useState({
    locationVillage: '',
    sellerType: '',
    bio: '',
    phoneNumber: '',
    taxId: ''
  });

  // Bank Details (Step 2)
  const [bankData, setBankData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast.error('Please login first');
      return;
    }
    checkExistingProfile();
  }, [isAuthenticated, navigate]);

  const checkExistingProfile = async () => {
    try {
      const profile = await sellerAPI.getProfile();
      if (profile) {
        setExistingProfile(profile);
        setProfileData({
          locationVillage: profile.locationVillage || '',
          sellerType: profile.sellerType || '',
          bio: profile.bio || '',
          phoneNumber: profile.phoneNumber || '',
          taxId: profile.taxId || ''
        });
        setBankData({
          accountHolderName: profile.bankDetails?.accountHolderName || '',
          accountNumber: profile.bankDetails?.accountNumber || '',
          ifscCode: profile.bankDetails?.ifscCode || '',
          bankName: profile.bankDetails?.bankName || '',
          branchName: profile.bankDetails?.branchName || ''
        });
      }
    } catch (error) {
      // No profile yet, continue with onboarding
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!profileData.locationVillage || !profileData.sellerType || !profileData.bio || !profileData.phoneNumber) {
          toast.error('Please fill all required profile fields');
          return false;
        }
        return true;
      case 2:
        if (!bankData.accountHolderName || !bankData.accountNumber || !bankData.ifscCode || !bankData.bankName) {
          toast.error('Please fill all required bank details');
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
    setSubmitting(true);
    try {
      const payload = {
        ...profileData,
        bankDetails: bankData
      };

      await sellerAPI.createProfile(payload);
      toast.success('Profile submitted for verification!');
      toast.info('Admin will review your application within 2-3 business days');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl font-semibold mb-2">Become a Seller</h1>
          <p className="text-muted-foreground">
            Complete your seller profile to start listing products
          </p>
        </motion.div>

        {/* Existing Profile Warning */}
        {existingProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 mb-8 border-l-4 border-l-primary">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Profile Status</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Your seller profile is: <Badge className="ml-2">{existingProfile.verificationStatus}</Badge></p>
                    {existingProfile.verificationStatus === 'PENDING' && (
                      <p className="mt-2">Your profile is under review. You'll be notified once approved.</p>
                    )}
                    {existingProfile.verificationStatus === 'REJECTED' && (
                      <p className="mt-2 text-destructive">Your profile was rejected. Please update and resubmit.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

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
            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Your Profile</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="village">Village/Town *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="village"
                          value={profileData.locationVillage}
                          onChange={(e) => setProfileData({...profileData, locationVillage: e.target.value})}
                          placeholder="e.g., Manali"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sellerType">Seller Type *</Label>
                      <Select
                        value={profileData.sellerType}
                        onValueChange={(value) => setProfileData({...profileData, sellerType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {sellerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">About Your Craft/Products *</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about your products, your story, and what makes your offerings unique..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">GST/Tax ID (Optional)</Label>
                      <Input
                        id="taxId"
                        value={profileData.taxId}
                        onChange={(e) => setProfileData({...profileData, taxId: e.target.value})}
                        placeholder="22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Bank Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Bank Details</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="accountHolder">Account Holder Name *</Label>
                    <Input
                      id="accountHolder"
                      value={bankData.accountHolderName}
                      onChange={(e) => setBankData({...bankData, accountHolderName: e.target.value})}
                      placeholder="As per bank records"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        id="accountNumber"
                        value={bankData.accountNumber}
                        onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ifsc">IFSC Code *</Label>
                      <Input
                        id="ifsc"
                        value={bankData.ifscCode}
                        onChange={(e) => setBankData({...bankData, ifscCode: e.target.value.toUpperCase()})}
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={bankData.bankName}
                        onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                        placeholder="State Bank of India"
                      />
                    </div>
                    <div>
                      <Label htmlFor="branch">Branch Name</Label>
                      <Input
                        id="branch"
                        value={bankData.branchName}
                        onChange={(e) => setBankData({...bankData, branchName: e.target.value})}
                        placeholder="Manali Branch"
                      />
                    </div>
                  </div>

                  <Card className="p-4 bg-muted/50 border-l-4 border-l-primary">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Secure & Private</p>
                        <p>Your bank details are encrypted and will only be used for payout processing.</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="font-serif text-2xl font-semibold mb-6">Review & Submit</h2>

                <div className="space-y-6">
                  {/* Profile Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Profile Information</h3>
                    <Card className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{profileData.locationVillage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">
                            {sellerTypes.find(t => t.value === profileData.sellerType)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{profileData.phoneNumber}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Bank Summary */}
                  <div>
                    <h3 className="font-medium mb-3">Bank Details</h3>
                    <Card className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Holder:</span>
                          <span className="font-medium">{bankData.accountHolderName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Number:</span>
                          <span className="font-medium">****{bankData.accountNumber.slice(-4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium">{bankData.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IFSC:</span>
                          <span className="font-medium">{bankData.ifscCode}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Verification Info */}
                  <Card className="p-6 bg-primary/5 border-2 border-primary/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium mb-2">What Happens Next?</h3>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>• Your profile will be reviewed by our admin team within 2-3 business days</p>
                          <p>• You'll receive an email notification once verified</p>
                          <p>• After approval, you can start listing your products</p>
                          <p>• Our team may contact you for additional verification if needed</p>
                        </div>
                      </div>
                    </div>
                  </Card>
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

            {currentStep < 3 ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit for Verification
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
