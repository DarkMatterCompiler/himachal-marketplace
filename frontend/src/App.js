import "App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "context/ThemeContext";
import { AuthProvider } from "context/AuthContext";
import { Navbar } from "components/Navbar";
import { Footer } from "components/Footer";
import { LandingPage } from "pages/LandingPage";
import { ProductDetailPage } from "pages/ProductDetailPage";
import { ProductsPage } from "pages/ProductsPage";
import { CartPage } from "pages/CartPage";
import { CheckoutPage } from "pages/CheckoutPage";
import { OrderHistoryPage } from "pages/OrderHistoryPage";
import { OrderTrackingPage } from "pages/OrderTrackingPage";
import { SellerDashboardPage } from "pages/SellerDashboardPage";
import { StoryStudioPage } from "pages/StoryStudioPage";
import { ManageProductsPage } from "pages/ManageProductsPage";
import { SellerOrdersPage } from "pages/SellerOrdersPage";
import { PayoutsPage } from "pages/PayoutsPage";
import { SellerOnboardingPage } from "pages/SellerOnboardingPage";
import { UserProfilePage } from "pages/UserProfilePage";
import { AdminDashboardPage } from "pages/AdminDashboardPage";
import { SellerVerificationPage } from "pages/SellerVerificationPage";
import { CommissionManagementPage } from "pages/CommissionManagementPage";
import { PayoutApprovalPage } from "pages/PayoutApprovalPage";
import { Toaster } from "components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<ProductsPage />} />
                <Route path="/category/:id" element={<ProductsPage />} />
                <Route path="/story" element={<LandingPage />} />
                
                {/* Buyer Pages */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                
                {/* Seller Pages */}
                <Route path="/seller/onboarding" element={<SellerOnboardingPage />} />
                <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                <Route path="/seller/story-studio" element={<StoryStudioPage />} />
                <Route path="/seller/products" element={<ManageProductsPage />} />
                <Route path="/seller/orders" element={<SellerOrdersPage />} />
                <Route path="/seller/orders/:orderId" element={<OrderTrackingPage />} />
                <Route path="/seller/payouts" element={<PayoutsPage />} />
                
                {/* Admin Pages */}
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/seller-verification" element={<SellerVerificationPage />} />
                <Route path="/admin/commission-management" element={<CommissionManagementPage />} />
                <Route path="/admin/payout-approval" element={<PayoutApprovalPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

