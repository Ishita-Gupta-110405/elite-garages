import { useState, useEffect, useMemo } from 'react';
import { api, setAuthToken } from './api';
import {
  Car, Search, Plus, LogOut, ShieldCheck, ShoppingBag,
  Edit3, Trash2, PackagePlus, History, AlertCircle, CheckCircle2,
  X, Crown, TrendingUp, Layers, AlertTriangle, CreditCard,
  Building2, Landmark, ArrowLeft, Lock, Receipt
} from 'lucide-react';

const getVehicleTheme = (make = '', model = '', category = '') => {
  const key = `${make} ${model}`.toLowerCase();

  if (key.includes('porsche')) {
    return {
      signatureName: 'Guards Red • Weissach Spec',
      swatchColor: '#e11d48',
      cardBorder: 'border-rose-900/40 hover:border-rose-500/60',
      accentText: 'text-rose-300',
      badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-700/40',
      image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
    };
  }
  if (key.includes('rivian')) {
    return {
      signatureName: 'Launch Forest Green',
      swatchColor: '#10b981',
      cardBorder: 'border-emerald-900/40 hover:border-emerald-500/60',
      accentText: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-700/40',
      image: 'https://images.unsplash.com/photo-1669215420018-098507d14861?auto=format&fit=crop&w=900&q=80',
    };
  }
  if (key.includes('bmw')) {
    return {
      signatureName: 'M-Sport Marina Bay Blue',
      swatchColor: '#3b82f6',
      cardBorder: 'border-blue-900/40 hover:border-blue-400/60',
      accentText: 'text-blue-300',
      badgeBg: 'bg-blue-950/60 text-blue-200 border-blue-700/40',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    };
  }
  if (key.includes('ford')) {
    return {
      signatureName: 'Antimatter Metallic Blue',
      swatchColor: '#0ea5e9',
      cardBorder: 'border-sky-900/40 hover:border-sky-400/60',
      accentText: 'text-sky-300',
      badgeBg: 'bg-sky-950/60 text-sky-200 border-sky-700/40',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
    };
  }
  if (key.includes('toyota')) {
    return {
      signatureName: 'Gazoo Racing Track Red',
      swatchColor: '#f43f5e',
      cardBorder: 'border-rose-900/40 hover:border-rose-400/60',
      accentText: 'text-rose-300',
      badgeBg: 'bg-rose-950/60 text-rose-200 border-rose-700/40',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
    };
  }
  if (key.includes('lucid') || key.includes('mercedes') || key.includes('audi')) {
    return {
      signatureName: 'Eureka Champagne Gold',
      swatchColor: '#d97706',
      cardBorder: 'border-amber-800/40 hover:border-amber-500/60',
      accentText: 'text-amber-200',
      badgeBg: 'bg-amber-950/60 text-amber-200 border-amber-700/40',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    };
  }

  const categoryImages = {
    Coupe: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=80',
    SUV: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
    Truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=900&q=80',
    Convertible: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    Sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
  };

  return {
    signatureName: 'Anthracite Metallic • Bespoke',
    swatchColor: '#eab308',
    cardBorder: 'border-stone-800 hover:border-amber-500/50',
    accentText: 'text-amber-200',
    badgeBg: 'bg-stone-800 text-amber-200 border-stone-700',
    image: categoryImages[category] || categoryImages.Coupe,
  };
};

const CATEGORIES = ['All', 'Coupe', 'Sedan', 'SUV', 'Truck', 'Convertible', 'Hatchback'];

export default function App() {
  // Always start logged out so login gate is presented first
  const [user, setUser] = useState(null);

  // Auth states
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ full_name: '', email: '', password: '' });

  // Inventory & Filter states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filters, setFilters] = useState({ make: '', model: '', category: '', min_price: '', max_price: '' });

  // Checkout / Payment Page State
  const [checkoutVehicle, setCheckoutVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'wire' | 'escrow'
  const [paymentForm, setPaymentForm] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    deliveryAddress: '',
    agreeTerms: false,
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Modals & Alerts
  const [banner, setBanner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', category: 'Coupe', price: '', quantity: '' });

  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState(3);

  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  const notify = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4500);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInventory();
  }, [user]);

  const kpis = useMemo(() => {
    const totalValuation = vehicles.reduce((acc, v) => acc + v.price * v.quantity, 0);
    const totalUnits = vehicles.reduce((acc, v) => acc + v.quantity, 0);
    const depletedCount = vehicles.filter((v) => v.quantity === 0).length;
    const distinctMarques = new Set(vehicles.map((v) => v.make.toLowerCase())).size;
    return { totalValuation, totalUnits, depletedCount, distinctMarques };
  }, [vehicles]);

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await api.register(authForm.full_name, authForm.email, authForm.password);
        notify('success', 'Account registered. Signing you in...');
      }
      const res = await api.login(authForm.email, authForm.password);
      setAuthToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const quickLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setAuthToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      notify('error', 'Run `python seed.py` in backend first to enable demo login.');
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setVehicles([]);
    setCheckoutVehicle(null);
  };

  // --- Search & Filter ---
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await api.searchVehicles(filters);
      setVehicles(data);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPill = async (cat) => {
    setActiveCategory(cat);
    const updatedCategory = cat === 'All' ? '' : cat;
    const nextFilters = { ...filters, category: updatedCategory };
    setFilters(nextFilters);
    setLoading(true);
    try {
      const data = await api.searchVehicles(nextFilters);
      setVehicles(data);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setActiveCategory('All');
    setFilters({ make: '', model: '', category: '', min_price: '', max_price: '' });
    fetchInventory();
  };

  // --- Checkout & Payment Flow ---
  const startCheckout = (vehicle) => {
    setCheckoutVehicle(vehicle);
    setPaymentMethod('card');
    setPaymentForm({
      cardholder: user.full_name || '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      deliveryAddress: '',
      agreeTerms: false,
    });
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.agreeTerms) {
      notify('error', 'Please confirm the purchase agreement checkbox before proceeding.');
      return;
    }
    setProcessingPayment(true);
    try {
      const updated = await api.purchaseVehicle(checkoutVehicle.id);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      notify('success', `Payment verified! ${checkoutVehicle.make} ${checkoutVehicle.model} purchase completed.`);
      setCheckoutVehicle(null);
    } catch (err) {
      notify('error', err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // --- Admin & Order History Actions ---
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle permanently from inventory?')) return;
    try {
      await api.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      notify('success', 'Vehicle removed from inventory.');
    } catch (err) {
      notify('error', err.message);
    }
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setVehicleForm({ make: '', model: '', category: 'Coupe', price: '', quantity: '' });
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setVehicleForm({
      make: v.make,
      model: v.model,
      category: v.category,
      price: v.price,
      quantity: v.quantity,
    });
    setShowModal(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    const payload = {
      ...vehicleForm,
      price: parseFloat(vehicleForm.price),
      quantity: parseInt(vehicleForm.quantity, 10),
    };
    try {
      if (editingVehicle) {
        const updated = await api.updateVehicle(editingVehicle.id, payload);
        setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        notify('success', 'Vehicle specifications updated.');
      } else {
        const created = await api.createVehicle(payload);
        setVehicles((prev) => [...prev, created]);
        notify('success', 'New vehicle added to Elite Garages.');
      }
      setShowModal(false);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.restockVehicle(restockTarget.id, restockAmount);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      notify('success', `Restocked +${restockAmount} units for ${updated.make} ${updated.model}.`);
      setRestockTarget(null);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const openOrderHistory = async () => {
    try {
      const data = await api.getOrderHistory();
      setOrders(data);
      setShowOrders(true);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      notify('success', `Order #${orderId} removed from history.`);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('Clear all purchase history records?')) return;
    try {
      await api.clearOrders();
      setOrders([]);
      notify('success', 'Purchase history cleared.');
    } catch (err) {
      notify('error', err.message);
    }
  };

  // ============================================================================
  // VIEW 1: LOGIN GATE (Soft Warm Charcoal & Muted Champagne Gold)
  // ============================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#121316] text-stone-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#181a1f] border border-stone-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3.5 mb-7">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-stone-100">
                Elite Garages
              </h1>
              <p className="text-xs text-stone-400">Showroom Inventory & Purchase Portal</p>
            </div>
          </div>

          {banner && (
            <div className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
              banner.type === 'error'
                ? 'bg-rose-950/50 border border-rose-800/60 text-rose-200'
                : 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-200'
            }`}>
              {banner.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{banner.text}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl focus:outline-none focus:border-amber-500/60 text-sm text-stone-100"
                  placeholder="Alex Rivera"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl focus:outline-none focus:border-amber-500/60 text-sm text-stone-100"
                placeholder="member@elitegarages.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl focus:outline-none focus:border-amber-500/60 text-sm text-stone-100"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500/90 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition cursor-pointer"
            >
              {isRegistering ? 'Create Account' : 'Sign In to Showroom'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-amber-300/90 hover:text-amber-200 cursor-pointer"
            >
              {isRegistering ? 'Already registered? Sign in' : 'New client? Register an account'}
            </button>
          </div>

          <div className="mt-7 pt-6 border-t border-stone-800/80">
            <p className="text-xs text-stone-400 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => quickLogin('admin@dealership.com', 'AdminPass123!')}
                className="py-2 px-3 bg-[#121316] hover:bg-stone-800 text-amber-300 text-xs font-medium rounded-xl border border-stone-800 transition cursor-pointer"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('buyer@dealership.com', 'BuyerPass123!')}
                className="py-2 px-3 bg-[#121316] hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-800 transition cursor-pointer"
              >
                Demo Buyer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: DEDICATED PAYMENT & CHECKOUT PAGE
  // ============================================================================
  if (checkoutVehicle) {
    const theme = getVehicleTheme(checkoutVehicle.make, checkoutVehicle.model, checkoutVehicle.category);
    const basePrice = Number(checkoutVehicle.price);
    const conciergeFee = Math.round(basePrice * 0.015);
    const luxuryTax = Math.round(basePrice * 0.05);
    const totalAmount = basePrice + conciergeFee + luxuryTax;

    return (
      <div className="min-h-screen bg-[#121316] text-stone-200 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setCheckoutVehicle(null)}
            className="inline-flex items-center gap-2 text-xs font-medium text-stone-400 hover:text-amber-300 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Elite Garages Showroom
          </button>

          {banner && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{banner.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Payment Form (3 cols) */}
            <div className="lg:col-span-3 bg-[#181a1f] border border-stone-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <Lock className="w-5 h-5 text-amber-300" />
                <h2 className="text-xl font-bold text-stone-100">Vehicle Acquisition & Payment</h2>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-[#121316] border-stone-800 text-stone-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Private Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition ${
                    paymentMethod === 'wire'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-[#121316] border-stone-800 text-stone-400'
                  }`}
                >
                  <Landmark className="w-4 h-4" /> Bank Wire
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('escrow')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer transition ${
                    paymentMethod === 'escrow'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-[#121316] border-stone-800 text-stone-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Escrow Finance
                </button>
              </div>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Registered Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.cardholder}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardholder: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                    placeholder="Alex Rivera"
                  />
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                        placeholder="4532 •••• •••• 8891"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-400 mb-1">Expiration</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-400 mb-1">Security Code (CVV)</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'wire' && (
                  <div className="p-4 bg-[#121316] border border-stone-800 rounded-xl text-xs text-stone-300 space-y-1">
                    <p className="font-semibold text-amber-300">Elite Garages Private Treasury Wire Instructions</p>
                    <p>Routing: 021000021 • Account: 8849-2910-44</p>
                    <p className="text-stone-400">Your vehicle allocation is locked immediately upon confirmation below.</p>
                  </div>
                )}

                {paymentMethod === 'escrow' && (
                  <div className="p-4 bg-[#121316] border border-stone-800 rounded-xl text-xs text-stone-300 space-y-1">
                    <p className="font-semibold text-amber-300">24-Month Concierge Escrow</p>
                    <p>Estimated Monthly Payment: ${Math.round(totalAmount / 24).toLocaleString()} / mo</p>
                    <p className="text-stone-400">Subject to verification on delivery.</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Delivery Address / Dealership Pickup</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.deliveryAddress}
                    onChange={(e) => setPaymentForm({ ...paymentForm, deliveryAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                    placeholder="742 Evergreen Terrace or 'Showroom Pickup'"
                  />
                </div>

                <label className="flex items-start gap-2.5 pt-2 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.agreeTerms}
                    onChange={(e) => setPaymentForm({ ...paymentForm, agreeTerms: e.target.checked })}
                    className="mt-0.5 accent-amber-400"
                  />
                  <span>
                    I confirm the purchase of the <strong>{checkoutVehicle.make} {checkoutVehicle.model}</strong> for <strong>${totalAmount.toLocaleString()}</strong> and authorize Elite Garages to deduct 1 unit from showroom stock.
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutVehicle(null)}
                    className="px-5 py-3 bg-[#121316] hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold border border-stone-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    {processingPayment ? 'Authorizing...' : `Confirm & Pay $${totalAmount.toLocaleString()}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Vehicle Summary & Invoice (2 cols) */}
            <div className="lg:col-span-2 bg-[#181a1f] border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-stone-900">
                  <img
                    src={theme.image}
                    alt={checkoutVehicle.model}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181a1f] via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}>
                    {checkoutVehicle.category}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-xs uppercase tracking-widest text-stone-400">{checkoutVehicle.make}</p>
                  <h3 className="text-2xl font-bold text-stone-100 mt-0.5">{checkoutVehicle.model}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.swatchColor }} />
                    <span className="text-xs text-stone-400">{theme.signatureName}</span>
                  </div>

                  <div className="mt-6 pt-5 border-t border-stone-800 space-y-2.5 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span>Base Vehicle Price</span>
                      <span>${basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Concierge Inspection & Prep (1.5%)</span>
                      <span>${conciergeFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Documentation & Luxury Tax (5%)</span>
                      <span>${luxuryTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-amber-300 pt-3 border-t border-stone-800">
                      <span>Total Due</span>
                      <span>${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#121316] border-t border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Includes immutable digital title & order ledger receipt.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: MAIN ELITE GARAGES SHOWROOM DASHBOARD
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#121316] text-stone-200">
      {/* Top Navbar */}
      <header className="border-b border-stone-800 bg-[#181a1f]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-wide text-stone-100">
                  Elite Garages
                </h1>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                  Showroom
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                <span>{user.full_name} ({user.email})</span>
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openOrderHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#121316] hover:bg-stone-800 text-stone-200 border border-stone-800 transition cursor-pointer"
            >
              <History className="w-4 h-4 text-amber-300" />
              {user.is_admin ? 'All Orders' : 'Purchase History'}
            </button>

            {user.is_admin && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#121316] hover:bg-rose-950/50 text-stone-400 hover:text-rose-300 border border-stone-800 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Notification Banner */}
        {banner && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between border ${
            banner.type === 'error'
              ? 'bg-rose-950/50 border-rose-800/60 text-rose-200'
              : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5 text-sm">
              {banner.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              <span>{banner.text}</span>
            </div>
            <button onClick={() => setBanner(null)} className="text-stone-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Executive KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">Inventory Value</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">
                ${kpis.totalValuation.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">Total Units in Stock</p>
              <p className="text-2xl font-bold text-stone-100 mt-1">{kpis.totalUnits} Cars</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-800 text-stone-300">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">Active Brands</p>
              <p className="text-2xl font-bold text-stone-100 mt-1">{kpis.distinctMarques} Marques</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-800 text-stone-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400">Out of Stock</p>
              <p className="text-2xl font-bold text-rose-300 mt-1">{kpis.depletedCount} Models</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryPill(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                  active
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-[#181a1f] text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="bg-[#181a1f] border border-stone-800 rounded-2xl p-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Make (e.g. Porsche, BMW)"
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="text"
              placeholder="Model (e.g. 911, M3)"
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="number"
              placeholder="Min Price ($)"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              className="px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500/60"
            />
            <input
              type="number"
              placeholder="Max Price ($)"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              className="px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:border-amber-500/60"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl px-4 py-2 transition cursor-pointer"
              >
                <Search className="w-4 h-4" /> Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-[#121316] hover:bg-stone-800 text-stone-300 text-xs font-medium rounded-xl border border-stone-800 transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="text-center py-20 text-stone-400 text-sm">Loading Elite Garages inventory...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-[#181a1f] border border-stone-800 rounded-2xl">
            <Car className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <p className="text-stone-300 font-medium">No matching vehicles found</p>
            <p className="text-xs text-stone-500 mt-1">Try resetting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => {
              const outOfStock = v.quantity === 0;
              const theme = getVehicleTheme(v.make, v.model, v.category);

              return (
                <div
                  key={v.id}
                  className={`bg-[#181a1f] border ${theme.cardBorder} rounded-2xl overflow-hidden flex flex-col justify-between transition duration-200 shadow-lg group`}
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-stone-900">
                      <img
                        src={theme.image}
                        alt={`${v.make} ${v.model}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181a1f] via-transparent to-transparent" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${theme.badgeBg}`}>
                          {v.category}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                            outOfStock
                              ? 'bg-rose-950/90 text-rose-200 border-rose-700/50'
                              : 'bg-stone-900/85 text-emerald-300 border-emerald-700/40'
                          }`}
                        >
                          {outOfStock ? 'Out of Stock' : `${v.quantity} in stock`}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-4 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40"
                          style={{ backgroundColor: theme.swatchColor }}
                        />
                        <span className="text-[11px] text-stone-300">{theme.signatureName}</span>
                      </div>
                    </div>

                    <div className="p-5 pb-2">
                      <p className="text-xs uppercase tracking-wider text-stone-400 font-medium">{v.make}</p>
                      <h2 className="text-xl font-bold text-stone-100 mt-0.5">{v.model}</h2>
                      <p className={`text-2xl font-bold ${theme.accentText} mt-2`}>
                        ${Number(v.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-4 space-y-2.5">
                    <button
                      onClick={() => startCheckout(v)}
                      disabled={outOfStock}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                        outOfStock
                          ? 'bg-[#121316] text-stone-600 border border-stone-800 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {outOfStock ? 'Unavailable' : 'Proceed to Checkout'}
                    </button>

                    {user.is_admin && (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-800">
                        <button
                          onClick={() => {
                            setRestockTarget(v);
                            setRestockAmount(3);
                          }}
                          className="py-1.5 px-2 bg-[#121316] hover:bg-stone-800 border border-stone-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-emerald-300 cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5" /> Restock
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          className="py-1.5 px-2 bg-[#121316] hover:bg-stone-800 border border-stone-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-stone-200 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-300" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="py-1.5 px-2 bg-[#121316] hover:bg-rose-950/60 border border-stone-800 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-100">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs text-stone-400 mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                  placeholder="Porsche"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                  placeholder="911 Carrera"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Category</label>
                <select
                  value={vehicleForm.category}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                >
                  <option value="Coupe">Coupe</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={vehicleForm.price}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={vehicleForm.quantity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#121316] border border-stone-800 rounded-xl text-xs font-medium text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold"
                >
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-stone-100 mb-1">Restock Vehicle</h3>
            <p className="text-xs text-stone-400 mb-4">
              Adding units to {restockTarget.make} {restockTarget.model} (Current: {restockTarget.quantity})
            </p>
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <input
                type="number"
                min="1"
                required
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#121316] border border-stone-800 rounded-xl text-sm text-stone-100"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 bg-[#121316] border border-stone-800 rounded-xl text-xs font-medium text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase History Modal with Delete Controls */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#181a1f] border border-stone-800 rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-100">Purchase History</h3>
                <p className="text-xs text-stone-400">Completed vehicle transactions</p>
              </div>
              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <button
                    onClick={handleClearAllOrders}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button onClick={() => setShowOrders(false)} className="text-stone-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-2.5 pr-1">
              {orders.length === 0 ? (
                <p className="text-sm text-stone-500 py-8 text-center">No purchase history records.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-3.5 bg-[#121316] border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-stone-200">Order #{o.id} • Vehicle ID: {o.vehicle_id}</p>
                      <p className="text-stone-400 mt-0.5">User ID: {o.user_id} • {new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-300 text-sm">
                        ${Number(o.purchase_price).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteOrder(o.id)}
                        title="Delete record"
                        className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}