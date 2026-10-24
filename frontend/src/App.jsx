import { useState, useEffect } from 'react';
import { api } from './api';
import {
  Car, Search, Plus, LogOut, ShieldCheck, ShoppingBag,
  Edit3, Trash2, PackagePlus, History, AlertCircle, CheckCircle2, X
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auth states
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ full_name: '', email: '', password: '' });

  // Inventory & Filter states
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ make: '', model: '', category: '', min_price: '', max_price: '' });

  // Modals & Alerts
  const [banner, setBanner] = useState(null); // { type: 'error' | 'success', text: '' }
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', category: 'Sedan', price: '', quantity: '' });

  const [restockTarget, setRestockTarget] = useState(null);
  const [restockAmount, setRestockAmount] = useState(5);

  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);

  const notify = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
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

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await api.register(authForm.full_name, authForm.email, authForm.password);
        notify('success', 'Account created! Logging you in...');
      }
      const res = await api.login(authForm.email, authForm.password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const quickLogin = async (email, password) => {
    try {
      const res = await api.login(email, password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) {
      notify('error', 'Run `python seed.py` in backend first to enable quick demo login.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setVehicles([]);
  };

  // --- Search & Filter ---
  const handleSearch = async (e) => {
    e.preventDefault();
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

  const handleResetFilters = () => {
    setFilters({ make: '', model: '', category: '', min_price: '', max_price: '' });
    fetchInventory();
  };

  // --- Inventory Actions ---
  const handlePurchase = async (vehicle) => {
    try {
      const updated = await api.purchaseVehicle(vehicle.id);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      notify('success', `Purchased ${vehicle.make} ${vehicle.model}! Ledger updated.`);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle permanently from inventory?')) return;
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
    setVehicleForm({ make: '', model: '', category: 'Sedan', price: '', quantity: '' });
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
        notify('success', 'Vehicle details updated.');
      } else {
        const created = await api.createVehicle(payload);
        setVehicles((prev) => [...prev, created]);
        notify('success', 'New vehicle added to showroom.');
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
      notify('success', `Restocked ${updated.make} ${updated.model} (+${restockAmount} units).`);
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

  // --- Render Auth View ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Car className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Apex Motors</h1>
              <p className="text-xs text-slate-400">Dealership Inventory & Ledger System</p>
            </div>
          </div>

          {banner && (
            <div className={`mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm ${
              banner.type === 'error' ? 'bg-red-950/60 border border-red-800 text-red-200' : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
            }`}>
              {banner.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{banner.text}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authForm.full_name}
                  onChange={(e) => setAuthForm({ ...authForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                  placeholder="Alex Rivera"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="you@dealership.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition cursor-pointer"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center mb-3">Instant Reviewer Demo Access</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickLogin('admin@dealership.com', 'AdminPass123!')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
              >
                Login as Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('buyer@dealership.com', 'BuyerPass123!')}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg border border-slate-700 transition cursor-pointer"
              >
                Login as Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Main Showroom Dashboard ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Apex Motors Inventory</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{user.full_name} ({user.email})</span>
                {user.is_admin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openOrderHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              {user.is_admin ? 'All Ledger Orders' : 'My Purchases'}
            </button>

            {user.is_admin && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900 hover:bg-red-950/50 text-slate-300 hover:text-red-300 border border-slate-800 transition cursor-pointer"
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
            banner.type === 'error' ? 'bg-red-950/60 border-red-800 text-red-200' : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2.5 text-sm">
              {banner.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{banner.text}</span>
            </div>
            <button onClick={() => setBanner(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Make (e.g. Porsche)"
              value={filters.make}
              onChange={(e) => setFilters({ ...filters, make: e.target.value })}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Model (e.g. 911)"
              value={filters.model}
              onChange={(e) => setFilters({ ...filters, model: e.target.value })}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupe</option>
              <option value="Truck">Truck</option>
              <option value="Convertible">Convertible</option>
              <option value="Hatchback">Hatchback</option>
            </select>
            <input
              type="number"
              placeholder="Min Price ($)"
              value={filters.min_price}
              onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max Price ($)"
              value={filters.max_price}
              onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl px-4 py-2 transition cursor-pointer"
              >
                <Search className="w-4 h-4" /> Filter
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading showroom inventory...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Car className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">No matching vehicles found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search filters or restocking inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => {
              const outOfStock = v.quantity === 0;
              return (
                <div
                  key={v.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {v.category}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          outOfStock
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {outOfStock ? 'Out of Stock' : `${v.quantity} in stock`}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{v.make} {v.model}</h2>
                    <p className="text-2xl font-extrabold text-indigo-400 mt-2">
                      ${Number(v.price).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
                    <button
                      onClick={() => handlePurchase(v)}
                      disabled={outOfStock}
                      className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                        outOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {outOfStock ? 'Unavailable' : 'Purchase Vehicle'}
                    </button>

                    {user.is_admin && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setRestockTarget(v);
                            setRestockAmount(5);
                          }}
                          className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <PackagePlus className="w-3.5 h-3.5 text-emerald-400" /> Restock
                        </button>
                        <button
                          onClick={() => openEditModal(v)}
                          className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-slate-200 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="py-1.5 px-2 bg-slate-800 hover:bg-red-950/60 text-xs font-medium rounded-lg flex items-center justify-center gap-1 text-red-400 cursor-pointer"
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

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingVehicle ? 'Update Vehicle' : 'Add New Vehicle'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveVehicle} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.make}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                  placeholder="Toyota"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                  placeholder="Supra"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={vehicleForm.category}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Truck">Truck</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={vehicleForm.price}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, price: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={vehicleForm.quantity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  {editingVehicle ? 'Save Changes' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockTarget && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold mb-1">Restock Inventory</h3>
            <p className="text-xs text-slate-400 mb-4">
              Adding units to {restockTarget.make} {restockTarget.model} (Current: {restockTarget.quantity})
            </p>
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <input
                type="number"
                min="1"
                required
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order History Ledger Modal */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Immutable Purchase Ledger</h3>
              <button onClick={() => setShowOrders(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2.5 pr-1">
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No purchase transactions recorded yet.</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">Order #{o.id} • Vehicle ID: {o.vehicle_id}</p>
                      <p className="text-slate-400 mt-0.5">User ID: {o.user_id} • {new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${Number(o.purchase_price).toLocaleString()}
                    </span>
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