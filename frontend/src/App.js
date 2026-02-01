import "App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "context/ThemeContext";
import { Navbar } from "components/Navbar";
import { Footer } from "components/Footer";
import { LandingPage } from "pages/LandingPage";
import { ProductDetailPage } from "pages/ProductDetailPage";
import { ProductsPage } from "pages/ProductsPage";
import { Toaster } from "components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
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
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

