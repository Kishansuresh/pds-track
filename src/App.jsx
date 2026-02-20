import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  LayoutDashboard, Warehouse, Truck, Store, BarChart2, MessageSquare, 
  AlertTriangle, Users, LogOut, Search, Bell, Package, ArrowUp, QrCode, Plus, 
  ShoppingCart, CheckCircle, X, User, ArrowDownToLine, MapPin, Navigation, CalendarCheck, Clock, Bookmark
} from "lucide-react";

// --- SUPABASE SETUP ---
const SUPABASE_URL = "https://lcippvjlbxylvakfnmfo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjaXBwdmpsYnh5bHZha2ZubWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MzY5MzMsImV4cCI6MjA4NzExMjkzM30.cHQhIKQcmWBz51GVemDJ6wtYbo5Splnne4OcM2r55wc";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- REUSABLE UI COMPONENTS ---
const Badge = ({ status }) => {
  const styles = {
    'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'in-transit': 'bg-blue-50 text-blue-700 border-blue-200',
    'pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'pending-reservation': 'bg-orange-50 text-orange-700 border-orange-200',
    'reserved': 'bg-purple-50 text-purple-700 border-purple-200',
    'low stock': 'bg-amber-50 text-amber-700 border-amber-200',
    'resolved': 'bg-slate-100 text-slate-600 border-slate-200',
    'critical': 'bg-rose-50 text-rose-700 border-rose-200',
    'normal': 'bg-teal-50 text-teal-700 border-teal-200'
  };
  const dots = {
    'delivered': 'bg-emerald-500', 'active': 'bg-emerald-500', 'normal': 'bg-teal-500',
    'in-transit': 'bg-blue-500', 'pending': 'bg-amber-500', 'low stock': 'bg-amber-500',
    'pending-reservation': 'bg-orange-500', 'reserved': 'bg-purple-500', 
    'resolved': 'bg-slate-400', 'critical': 'bg-rose-500'
  };

  const safeStatus = (status || 'normal').toLowerCase();
  const displayLabel = status === 'pending-reservation' ? 'Pending Approval' : status;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-max capitalize transition-colors duration-300 ${styles[safeStatus] || styles['normal']}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[safeStatus] || dots['normal']}`}></span>
      {displayLabel || 'Normal'}
    </span>
  );
};

const StatCard = ({ title, value, subtitle, icon: Icon, type = "default" }) => {
  const styles = {
    default: "bg-white text-slate-800 border-slate-100",
    primary: "bg-teal-600 text-white border-teal-700",
    alert: "bg-rose-50 text-rose-900 border-rose-100",
    warning: "bg-amber-50 text-amber-900 border-amber-100"
  };
  const iconStyles = {
    default: "bg-slate-100 text-slate-600", primary: "bg-teal-500/50 text-white",
    alert: "bg-rose-200/50 text-rose-600", warning: "bg-amber-200/50 text-amber-600"
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${styles[type]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 ${type === 'primary' ? 'text-teal-100' : 'text-slate-500'}`}>{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl ${iconStyles[type]}`}><Icon size={20} /></div>
      </div>
      <div className="text-sm flex items-center gap-1">
        <span className={type === 'primary' ? 'text-teal-100' : 'text-slate-500'}>{subtitle}</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, current, max, unit, status }) => {
  const safeCurrent = Number(current) || 0;
  const percentage = Math.min(100, Math.max(0, (safeCurrent / max) * 100));
  const colors = { 'Normal': 'bg-teal-500', 'Low Stock': 'bg-amber-500', 'Critical': 'bg-rose-500' };

  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="font-bold text-slate-800 mr-2">{label}</span>
          <span className="text-sm text-slate-500">{safeCurrent} / {max} {unit}</span>
        </div>
        <Badge status={status} />
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${colors[status] || colors['Normal']}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- AUTO-CLOSING GPS MAP SIMULATOR ---
const GpsTrackingModal = ({ isOpen, onClose, shipment, onArrival }) => {
  const [isArrived, setIsArrived] = useState(false);

  useEffect(() => {
    let driveTimer, closeTimer;
    if (isOpen) {
      setIsArrived(false);
      
      // Truck finishes driving exactly at 8 seconds
      driveTimer = setTimeout(() => {
        setIsArrived(true);
      }, 8000);

      // Modal auto-closes and triggers DB arrival hook at 9.5 seconds
      closeTimer = setTimeout(() => {
        if (onArrival && shipment) onArrival(shipment);
        onClose();
      }, 9500);
    }
    return () => { clearTimeout(driveTimer); clearTimeout(closeTimer); };
  }, [isOpen, onClose, shipment, onArrival]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-xl text-slate-800">Live Vehicle GPS Tracking</h3>
            <p className="text-sm text-slate-500">Shipment Ref: {shipment?.id?.substring(0,8)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"><X size={18} /></button>
        </div>
        
        <style>
          {`
            @keyframes driveMap {
              0%   { transform: translate(10px, 180px); }
              25%  { transform: translate(150px, 180px); }
              35%  { transform: translate(150px, 80px); }
              60%  { transform: translate(350px, 80px); }
              80%  { transform: translate(350px, 220px); }
              100% { transform: translate(520px, 220px); } /* Stops exactly at destination */
            }
          `}
        </style>
        <div className="w-full h-72 bg-[#e5e3df] rounded-2xl border border-slate-300 overflow-hidden relative mb-4 shadow-inner">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 196 L 600 196 M 166 0 L 166 300 M 0 96 L 600 96 M 366 0 L 366 300 M 0 236 L 600 236 M 536 0 L 536 300" stroke="#ffffff" strokeWidth="16" />
            <path d="M 0 196 L 600 196 M 166 0 L 166 300 M 0 96 L 600 96 M 366 0 L 366 300 M 0 236 L 600 236 M 536 0 L 536 300" stroke="#f0ede6" strokeWidth="8" />
            <path d="M 10 196 L 166 196 L 166 96 L 366 96 L 366 236 L 536 236" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            <circle cx="536" cy="236" r="8" fill="#ef4444" stroke="#fff" strokeWidth="2" />
            <circle cx="10" cy="196" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
          </svg>
          
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 z-20">
            {isArrived ? <CheckCircle size={14} className="text-emerald-500"/> : <Navigation size={14} className="text-blue-500 animate-pulse"/>}
            {isArrived ? "Speed: 0 km/h" : "Speed: 42 km/h"}
          </div>

          <div className="absolute top-0 left-0 z-10" style={{ animation: 'driveMap 8s linear forwards' }}>
            <div className="w-8 h-8 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center shadow-lg relative -ml-4 -mt-4">
              <Truck size={14} className="text-blue-600" />
              <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">KA-01-AB-1234</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Live Coordinates</p>
            <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
               <MapPin size={14} className="text-blue-500"/> {isArrived ? "Destination Reached" : "12.9716° N, 77.5946° E"}
            </p>
          </div>
          <div className={`p-4 rounded-xl border transition-colors ${isArrived ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-xs font-semibold uppercase mb-1 ${isArrived ? 'text-emerald-600' : 'text-slate-400'}`}>Status</p>
            <p className={`text-sm font-bold flex items-center gap-1 ${isArrived ? 'text-emerald-700' : 'text-teal-600'}`}>
              <Clock size={14}/> {isArrived ? "ARRIVED! Updating Systems..." : "Arriving Shortly..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LAYOUT COMPONENTS ---
const Sidebar = ({ role, setRole }) => {
  const location = useLocation();
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium cursor-pointer transition-all ${isActive(to) ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
      <Icon size={18} /><span>{label}</span>
    </Link>
  );

  return (
    <aside className="w-64 bg-[#0f172a] h-screen flex flex-col text-slate-300 border-r border-slate-800 sticky top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-teal-500 p-1.5 rounded-lg"><Package size={20} className="text-white" /></div>
          <h1 className="text-xl font-bold text-white tracking-wide">PDS Track</h1>
        </div>
        <p className="text-xs text-amber-500 font-semibold capitalize">{role} Portal</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {role === 'admin' && (
          <><NavItem to="/" icon={LayoutDashboard} label="Overview" /><NavItem to="/shipments" icon={Truck} label="Shipments" /><NavItem to="/complaints" icon={MessageSquare} label="Complaints" /></>
        )}
        {role === 'warehouse' && (
          <><NavItem to="/" icon={Package} label="Inventory" /><NavItem to="/shipments" icon={Truck} label="Shipments" /></>
        )}
        {role === 'dealer' && (
          <><NavItem to="/" icon={LayoutDashboard} label="Dashboard" /><NavItem to="/inventory" icon={Package} label="Inventory" /><NavItem to="/incoming" icon={ArrowDownToLine} label="Incoming" /><NavItem to="/reservations" icon={Bookmark} label="Reservations" /><NavItem to="/sales" icon={ShoppingCart} label="Sales" /></>
        )}
        {role === 'citizen' && (
          <><NavItem to="/" icon={User} label="My Quota & Alerts" /><NavItem to="/complaints" icon={MessageSquare} label="My Complaints" /></>
        )}
      </nav>
      <div className="p-4 border-t border-slate-800 relative">
        <LogOut size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-800 text-slate-300 border-none rounded-xl py-3 pl-10 pr-8 text-sm focus:ring-1 focus:ring-teal-500 cursor-pointer outline-none hover:bg-slate-700 transition-colors">
          <option value="admin">Admin View</option>
          <option value="warehouse">Warehouse View</option>
          <option value="dealer">Dealer View</option>
          <option value="citizen">Citizen View</option>
        </select>
      </div>
    </aside>
  );
};

const Topbar = ({ role }) => {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const titles = {
    admin: { title: 'Admin Dashboard', sub: 'State Overview', init: 'A' },
    warehouse: { title: 'Warehouse Panel', sub: 'Central Operations', init: 'W' },
    dealer: { title: 'Dealer Dashboard', sub: 'Ration Shop Portal', init: 'D' },
    citizen: { title: 'Citizen Portal', sub: 'Rajesh Kumar', init: 'R' }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm relative">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{titles[role].title}</h2>
        <p className="text-xs text-slate-500">{titles[role].sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">1</span>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 bg-slate-50"><h4 className="font-bold text-slate-800 text-sm">Notifications</h4></div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Truck size={16}/></div>
                  <div><p className="text-sm font-semibold text-slate-800">System Ready</p><p className="text-xs text-slate-500">Database connected perfectly.</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md">{titles[role].init}</div>
      </div>
    </header>
  );
};

// --- DASHBOARDS ---

const AdminDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'overview';
  const [counts, setCounts] = useState({ warehouses: 0, shops: 0, complaints: 0 });
  const [shipments, setShipments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchData = async () => {
    const { count: wCount } = await supabase.from('warehouses').select('*', { count: 'exact', head: true });
    const { count: sCount } = await supabase.from('ration_shops').select('*', { count: 'exact', head: true });
    const { count: cCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    setCounts({ warehouses: wCount || 0, shops: sCount || 0, complaints: cCount || 0 });

    const { data: shipData } = await supabase.from('shipments').select('*').order('dispatched_at', { ascending: false }).limit(10);
    if (shipData) setShipments(shipData);

    const { data: compData } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(10);
    if (compData) setComplaints(compData);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleResolveComplaint = async (id) => {
    // Optimistic Update
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    fetchData(); 
  };

  const handleAutoDeliver = async (shp) => {
    // Optimistic Update: Instantly change status to Delivered
    setShipments(prev => prev.map(s => s.id === shp.id ? { ...s, status: 'delivered' } : s));
    await supabase.from('shipments').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', shp.id);
    fetchData();
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <GpsTrackingModal isOpen={trackModalOpen} onClose={() => setTrackModalOpen(false)} shipment={selectedShipment} onArrival={handleAutoDeliver} />
      
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['Overview', 'Shipments', 'Complaints'].map(tab => (
          <Link to={tab === 'Overview' ? '/' : `/${tab.toLowerCase()}`} key={tab} className={`font-bold pb-3 px-1 border-b-2 transition-colors ${activeTab.toLowerCase() === tab.toLowerCase() ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab}
          </Link>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Warehouses" value={counts.warehouses} subtitle="Registered in DB" icon={Warehouse} />
          <StatCard title="Active Ration Shops" value={counts.shops} subtitle="Registered in DB" icon={Store} type="primary" />
          <StatCard title="Total Shipments" value={shipments.length} subtitle="Recent records" icon={Truck} />
          <StatCard title="Pending Complaints" value={counts.complaints} subtitle="Awaiting review" icon={AlertTriangle} type="alert" />
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between"><h3 className="font-bold">Database Shipments</h3></div>
          <div className="divide-y divide-slate-100">
            {shipments.length === 0 ? <p className="p-6 text-slate-500">No shipments found.</p> : shipments.map(shp => (
              <div key={shp.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1"><span className="font-bold text-slate-800">ID: {shp.id.substring(0,8)}</span><Badge status={shp.status} /></div>
                  <p className="text-sm text-slate-500">Items: {JSON.stringify(shp.items)}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-sm text-slate-500 font-medium">{new Date(shp.dispatched_at).toLocaleDateString()}</span>
                  {shp.status === 'in-transit' && (
                    <button onClick={() => { setSelectedShipment(shp); setTrackModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
                      <MapPin size={12}/> Track GPS
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold">Admin Complaint Resolution</h3>
            <p className="text-xs text-slate-500 mt-1">Review and resolve issues raised by Citizens.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.length === 0 ? <p className="p-6 text-slate-500">No complaints found.</p> : complaints.map(cmp => (
              <div key={cmp.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1"><span className="font-bold text-slate-800">{cmp.complainant_name}</span><Badge status={cmp.status} /></div>
                  <p className="text-sm text-slate-600">{cmp.complaint_text}</p>
                </div>
                {cmp.status !== 'resolved' && (
                  <button onClick={() => handleResolveComplaint(cmp.id)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-emerald-200">
                    <CheckCircle size={16} /> Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WarehouseDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'inventory';
  
  const [stock, setStock] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipData, setShipData] = useState({ rice: '', wheat: '' });

  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const fetchData = async () => {
    const { data: stockData } = await supabase.from('warehouse_stock').select('id, commodity_type, total_quantity_kg');
    if (stockData) setStock(stockData);

    const { data: shipRecord } = await supabase.from('shipments').select('*').order('dispatched_at', { ascending: false }).limit(10);
    if (shipRecord) setShipments(shipRecord);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleNewShipment = async (e) => {
    e.preventDefault();
    const riceToShip = Number(shipData.rice) || 0;
    const wheatToShip = Number(shipData.wheat) || 0;

    const riceRow = stock.find(s => s.commodity_type?.toLowerCase() === 'rice');
    const wheatRow = stock.find(s => s.commodity_type?.toLowerCase() === 'wheat');

    if (riceRow && riceRow.total_quantity_kg < riceToShip) { alert("Error: Insufficient Rice stock in Warehouse."); return; }
    if (wheatRow && wheatRow.total_quantity_kg < wheatToShip) { alert("Error: Insufficient Wheat stock in Warehouse."); return; }

    // Optimistic Update: Deduct instantly from UI
    setStock(prev => prev.map(s => {
      if (s.commodity_type?.toLowerCase() === 'rice') return { ...s, total_quantity_kg: Math.max(0, s.total_quantity_kg - riceToShip) };
      if (s.commodity_type?.toLowerCase() === 'wheat') return { ...s, total_quantity_kg: Math.max(0, s.total_quantity_kg - wheatToShip) };
      return s;
    }));

    setIsModalOpen(false);
    setShipData({ rice: '', wheat: '' });

    if (riceRow && riceToShip > 0) await supabase.from('warehouse_stock').update({ total_quantity_kg: Math.max(0, riceRow.total_quantity_kg - riceToShip) }).eq('id', riceRow.id);
    if (wheatRow && wheatToShip > 0) await supabase.from('warehouse_stock').update({ total_quantity_kg: Math.max(0, wheatRow.total_quantity_kg - wheatToShip) }).eq('id', wheatRow.id);

    await supabase.from('shipments').insert([
      { status: 'in-transit', items: { "Rice": `${riceToShip}kg`, "Wheat": `${wheatToShip}kg` } }
    ]);
    
    fetchData(); 
  };

  const handleAutoDeliver = async (shp) => {
    // Optimistic UI update: Instantly convert badge to Delivered
    setShipments(prev => prev.map(s => s.id === shp.id ? { ...s, status: 'delivered' } : s));
    await supabase.from('shipments').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', shp.id);
    fetchData();
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <GpsTrackingModal isOpen={trackModalOpen} onClose={() => setTrackModalOpen(false)} shipment={selectedShipment} onArrival={handleAutoDeliver} />

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['Inventory', 'Shipments'].map(tab => (
          <Link to={tab === 'Inventory' ? '/' : `/${tab.toLowerCase()}`} key={tab} className={`font-bold pb-3 px-1 border-b-2 transition-colors ${activeTab.toLowerCase() === tab.toLowerCase() ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab}
          </Link>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Live Database Inventory (Warehouse)</h3>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer">
              <Plus size={16} /> New Shipment
            </button>
          </div>
          {stock.length === 0 ? <p className="text-slate-500">No stock data found.</p> : stock.map((item, idx) => (
            <ProgressBar key={idx} label={item.commodity_type || 'Unknown'} current={item.total_quantity_kg} max={10000} unit="kg" status={item.total_quantity_kg < 2000 ? 'Low Stock' : 'Normal'} />
          ))}
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
           <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Dispatched Shipments</h3>
           </div>
           <div className="divide-y divide-slate-100">
             {shipments.map(shp => (
                <div key={shp.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-teal-50 text-teal-600 p-2 rounded-lg"><Truck size={18}/></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1"><span className="font-bold text-slate-800">ID: {shp.id.substring(0,8)}</span><Badge status={shp.status} /></div>
                      <p className="text-sm text-slate-600">{JSON.stringify(shp.items)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-sm font-medium text-slate-500">{new Date(shp.dispatched_at).toLocaleDateString()}</span>
                    {shp.status === 'in-transit' && (
                      <button onClick={() => { setSelectedShipment(shp); setTrackModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200 cursor-pointer">
                        <MapPin size={12}/> Track GPS
                      </button>
                    )}
                  </div>
                </div>
             ))}
           </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dispatch New Shipment">
        <form onSubmit={handleNewShipment} className="space-y-4">
          <p className="text-xs text-rose-500 font-medium">*Dispatching will instantly deduct stock from Warehouse DB</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rice (kg)</label>
              <input type="number" required value={shipData.rice} onChange={e => setShipData({...shipData, rice: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wheat (kg)</label>
              <input type="number" required value={shipData.wheat} onChange={e => setShipData({...shipData, wheat: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors mt-4">Dispatch & Update Inventory</button>
        </form>
      </Modal>
    </div>
  );
};

const DealerDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'dashboard';
  
  const [sales, setSales] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [shopData, setShopData] = useState({ id: null, rice: 0, wheat: 0 });
  const [incomingShipments, setIncomingShipments] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleData, setSaleData] = useState({ name: '', amount: '', rice: '', wheat: '' });
  
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  const MAX_CAPACITY = 2000;

  const fetchDealerData = async () => {
    const { data: txns } = await supabase.from('transactions').select('*').neq('payment_status', 'pending-reservation').order('created_at', { ascending: false }).limit(20);
    if (txns) setSales(txns);

    const { data: resData } = await supabase.from('transactions').select('*').eq('payment_status', 'pending-reservation').order('created_at', { ascending: false });
    if (resData) setReservations(resData);

    const { data: shop } = await supabase.from('ration_shops').select('id, current_stock_rice, current_stock_wheat').limit(1).single();
    if (shop) setShopData({ id: shop.id, rice: Number(shop.current_stock_rice) || 0, wheat: Number(shop.current_stock_wheat) || 0 });

    const { data: shipments } = await supabase.from('shipments').select('*').in('status', ['pending', 'in-transit']).order('dispatched_at', { ascending: false });
    if (shipments) setIncomingShipments(shipments);
  };

  useEffect(() => { fetchDealerData(); }, [activeTab]);

  const handleRecordSale = async (e) => {
    e.preventDefault();
    const riceSold = Number(saleData.rice) || 0;
    const wheatSold = Number(saleData.wheat) || 0;

    if (riceSold > shopData.rice || wheatSold > shopData.wheat) { alert("Error: Insufficient physical stock for this sale."); return; }
    if (!shopData.id) { alert("Error: Shop database record not found."); return; }

    // Instant UI update
    setShopData(prev => ({ ...prev, rice: Math.max(0, prev.rice - riceSold), wheat: Math.max(0, prev.wheat - wheatSold) }));
    setIsModalOpen(false);
    setSaleData({ name: '', amount: '', rice: '', wheat: '' });

    // Background Sync
    await supabase.from('transactions').insert([
      { amount: Number(saleData.amount), items: { "Type": "Citizen Sale", "Rice": `${riceSold}kg`, "Wheat": `${wheatSold}kg`, "Customer": saleData.name }, payment_status: 'success' }
    ]);
    await supabase.from('ration_shops').update({ current_stock_rice: Math.max(0, shopData.rice - riceSold), current_stock_wheat: Math.max(0, shopData.wheat - wheatSold) }).eq('id', shopData.id);
    
    fetchDealerData();
  };

  // OPTIMISTIC UPDATE: INSTANT STATUS & STOCK CHANGE
  const handleAcceptShipment = async (shp) => {
    let addedRice = 0, addedWheat = 0;
    if (shp.items) {
      const rMatch = String(shp.items.Rice || '').match(/(\d+)/);
      const wMatch = String(shp.items.Wheat || '').match(/(\d+)/);
      if (rMatch) addedRice = parseInt(rMatch[0], 10);
      if (wMatch) addedWheat = parseInt(wMatch[0], 10);
    }

    if ((shopData.rice + addedRice) > MAX_CAPACITY || (shopData.wheat + addedWheat) > MAX_CAPACITY) {
      alert(`Capacity Warning: Accepting this pushes inventory over the ${MAX_CAPACITY}kg limit. Sell existing stock first.`);
      return;
    }

    if (!shopData.id) { alert("Error: Shop database record not found."); return; }

    // Instant UI Update: Remove from incoming view & Boost Inventory
    setIncomingShipments(prev => prev.map(s => s.id === shp.id ? { ...s, status: 'delivered' } : s));
    setShopData(prev => ({ ...prev, rice: prev.rice + addedRice, wheat: prev.wheat + addedWheat }));
    
    const cost = (addedRice * 30) + (addedWheat * 20);

    // Background Sync
    await supabase.from('shipments').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', shp.id);
    await supabase.from('ration_shops').update({ current_stock_rice: shopData.rice + addedRice, current_stock_wheat: shopData.wheat + addedWheat }).eq('id', shopData.id);
    await supabase.from('transactions').insert([
      { amount: cost, items: { "Type": "Warehouse Restock", "Ref": shp.id.substring(0,8), "Added": `Rice: ${addedRice}kg, Wheat: ${addedWheat}kg` }, payment_status: 'paid_to_warehouse' }
    ]);
    
    fetchDealerData();
  };

  const handleApproveReservation = async (res) => {
    const riceReq = parseInt(res.items.Rice || '0', 10);
    const wheatReq = parseInt(res.items.Wheat || '0', 10);

    if (shopData.rice < riceReq || shopData.wheat < wheatReq) { alert("Error: Not enough physical stock to reserve."); return; }
    if (!shopData.id) return;

    // Instant UI Update
    setReservations(prev => prev.filter(r => r.id !== res.id));
    setShopData(prev => ({ ...prev, rice: Math.max(0, prev.rice - riceReq), wheat: Math.max(0, prev.wheat - wheatReq) }));
    
    // Background Sync
    await supabase.from('ration_shops').update({ current_stock_rice: Math.max(0, shopData.rice - riceReq), current_stock_wheat: Math.max(0, shopData.wheat - wheatReq) }).eq('id', shopData.id);
    await supabase.from('transactions').update({ payment_status: 'reserved' }).eq('id', res.id);
    
    fetchDealerData();
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <GpsTrackingModal isOpen={trackModalOpen} onClose={() => setTrackModalOpen(false)} shipment={selectedShipment} onArrival={handleAcceptShipment} />

      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['Dashboard', 'Inventory', 'Incoming', 'Reservations', 'Sales'].map(tab => (
          <Link to={tab === 'Dashboard' ? '/' : `/${tab.toLowerCase()}`} key={tab} className={`font-bold pb-3 px-1 border-b-2 transition-colors ${activeTab.toLowerCase() === tab.toLowerCase() ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {tab}
          </Link>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Transactions" value={sales.length} subtitle="Recorded in DB" icon={ShoppingCart} type="primary" />
          <StatCard title="Current Rice Stock" value={`${shopData.rice} kg`} subtitle="Live from DB" icon={Package} />
          <StatCard title="Current Wheat Stock" value={`${shopData.wheat} kg`} subtitle="Live from DB" icon={Package} />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-4xl">
          <h3 className="font-bold text-slate-800 mb-6">Live Shop Inventory (Auto-Updates)</h3>
          <ProgressBar label="Rice" current={shopData.rice} max={MAX_CAPACITY} unit="kg" status={shopData.rice < 200 ? 'Critical' : 'Normal'} />
          <ProgressBar label="Wheat" current={shopData.wheat} max={MAX_CAPACITY} unit="kg" status={shopData.wheat < 200 ? 'Critical' : 'Normal'} />
        </div>
      )}

      {activeTab === 'incoming' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
           <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between">
              <h3 className="font-bold text-slate-800">Pending Deliveries from Warehouse</h3>
           </div>
           <div className="divide-y divide-slate-100">
             {incomingShipments.length === 0 ? <p className="p-6 text-slate-500">No incoming shipments found.</p> : incomingShipments.map(shp => (
                <div key={shp.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 text-blue-600 p-2 rounded-lg"><Truck size={18}/></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1"><span className="font-bold text-slate-800">ID: {shp.id.substring(0,8)}</span><Badge status={shp.status} /></div>
                      <p className="text-sm text-slate-600">{JSON.stringify(shp.items)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {shp.status === 'in-transit' && (
                      <button onClick={() => { setSelectedShipment(shp); setTrackModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer">
                        <MapPin size={14}/> Track GPS
                      </button>
                    )}
                    {shp.status === 'in-transit' && (
                      <button onClick={() => handleAcceptShipment(shp)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer">
                        <CheckCircle size={16} /> Fast Receive
                      </button>
                    )}
                  </div>
                </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-5xl">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
             <h3 className="font-bold text-slate-800">Citizen Pre-booking Requests</h3>
             <p className="text-xs text-slate-500 mt-1">Approve these requests to reserve and instantly deduct physical stock.</p>
          </div>
          <div className="divide-y divide-slate-100">
             {reservations.length === 0 ? <p className="p-6 text-slate-500">No pending reservations.</p> : reservations.map((res) => (
               <div key={res.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                 <div className="flex items-start gap-4">
                    <div className="mt-1 bg-orange-50 text-orange-600 p-2 rounded-lg"><CalendarCheck size={18}/></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-slate-800">{res.items?.Customer || 'Unknown'}</span>
                         <Badge status={res.payment_status} />
                      </div>
                      <p className="text-sm text-slate-600">Requested: {res.items?.Rice} Rice, {res.items?.Wheat} Wheat</p>
                      <p className="text-xs font-bold text-teal-600 mt-1">Pickup: {res.items?.Date}</p>
                    </div>
                 </div>
                 <button onClick={() => handleApproveReservation(res)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-purple-600/20">
                   <Bookmark size={16} /> Approve & Reserve Stock
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-5xl">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-slate-800">Live Database Transactions</h3>
             </div>
             <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-teal-600/20">
              <Plus size={16} /> Record Citizen Sale
            </button>
          </div>
          <div className="divide-y divide-slate-100">
             {sales.length === 0 ? <p className="p-6 text-slate-500">No transactions found.</p> : sales.map((sale) => {
               const isRestock = sale.items?.Type === "Warehouse Restock";
               const isPrebook = sale.payment_status === "reserved";
               
               return (
                 <div key={sale.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${isRestock ? 'bg-amber-500' : isPrebook ? 'bg-purple-500' : 'bg-slate-800'}`}>
                        {isRestock ? <Truck size={16}/> : isPrebook ? <Bookmark size={16}/> : (sale.items?.Customer || sale.profiles?.full_name || 'C')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-bold text-slate-800">{isRestock ? "Warehouse Payment" : (sale.items?.Customer || sale.profiles?.full_name || 'Walk-in Citizen')}</span>
                           {isPrebook && <Badge status="reserved" />}
                        </div>
                        <p className="text-sm text-slate-500">{isRestock ? `Ref: ${sale.items?.Ref} (${sale.items?.Added})` : `Sold: ${sale.items?.Rice || '0'}, ${sale.items?.Wheat || '0'}`}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`font-bold ${isRestock ? 'text-rose-600' : isPrebook ? 'text-purple-600' : 'text-teal-600'}`}>
                        {isRestock ? '-' : ''}₹{sale.amount || 0}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(sale.created_at).toLocaleDateString()}</p>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Sale & Deduct Stock">
        <form onSubmit={handleRecordSale} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input type="text" required value={saleData.name} onChange={e => setSaleData({...saleData, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Meena Devi" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rice Sold (kg)</label>
              <input type="number" required value={saleData.rice} onChange={e => setSaleData({...saleData, rice: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wheat Sold (kg)</label>
              <input type="number" required value={saleData.wheat} onChange={e => setSaleData({...saleData, wheat: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Bill Amount (₹)</label>
            <input type="number" required value={saleData.amount} onChange={e => setSaleData({...saleData, amount: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="0.00" />
          </div>
          <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors mt-4">Complete Transaction & Deduct Stock</button>
        </form>
      </Modal>
    </div>
  );
};

const CitizenDashboard = () => {
  const location = useLocation();
  const activeTab = location.pathname.replace('/', '') || 'rations';
  
  const [complaints, setComplaints] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [shopStock, setShopStock] = useState({ rice: 0, wheat: 0 });

  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [isPrebookOpen, setIsPrebookOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: 'Rajesh Kumar', text: '' }); 
  const [prebookData, setPrebookData] = useState({ date: '' });

  const fetchData = async () => {
    const { data: compData } = await supabase.from('reports').select('*').eq('complainant_name', 'Rajesh Kumar').order('created_at', { ascending: false });
    if (compData) setComplaints(compData);

    const { data: resData } = await supabase.from('transactions').select('*').contains('items', { Customer: 'Rajesh Kumar' }).in('payment_status', ['pending-reservation', 'reserved']).order('created_at', { ascending: false });
    if (resData) setMyReservations(resData);

    const { data: shop } = await supabase.from('ration_shops').select('current_stock_rice, current_stock_wheat').limit(1).single();
    if (shop) setShopStock({ rice: Number(shop.current_stock_rice) || 0, wheat: Number(shop.current_stock_wheat) || 0 });
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const submitComplaint = async (e) => {
    e.preventDefault();
    await supabase.from('reports').insert([{ complainant_name: formData.name, complaint_text: formData.text, ration_id: 'RATION-12345', status: 'pending' }]);
    setIsComplaintOpen(false);
    setFormData({ ...formData, text: '' }); 
    fetchData();
  };

  const handlePrebook = async (e) => {
    e.preventDefault();
    const riceToBook = 30; const wheatToBook = 10;

    await supabase.from('transactions').insert([{ 
      amount: 0, 
      items: { "Type": "Pre-book Request", "Customer": formData.name, "Rice": `${riceToBook}kg`, "Wheat": `${wheatToBook}kg`, "Date": prebookData.date }, 
      payment_status: 'pending-reservation' 
    }]);

    setIsPrebookOpen(false);
    setPrebookData({ date: '' });
    fetchData();
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        {['Rations', 'Complaints'].map(tab => (
          <Link to={tab === 'Rations' ? '/' : `/${tab.toLowerCase()}`} key={tab} className={`font-bold pb-3 px-1 border-b-2 transition-colors ${activeTab.toLowerCase() === tab.toLowerCase() ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            My {tab}
          </Link>
        ))}
      </div>

      {activeTab === 'rations' && (
        <div className="max-w-4xl space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-white"></div>
            <div className="bg-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg border-4 border-white">
              <User size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1 relative z-10">Rajesh Kumar</h2>
            <p className="text-slate-500 mb-6 relative z-10 font-medium">Ration Card No: <span className="text-slate-800">RATION-12345 (AAY)</span></p>
            
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Rice Quota</p>
                <p className="text-2xl font-bold text-teal-600">30 kg</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Monthly Wheat Quota</p>
                <p className="text-2xl font-bold text-amber-600">10 kg</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Store size={18}/> Local Shop Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-700">Rice</span>
                    {shopStock.rice >= 30 ? <Badge status="Normal" /> : shopStock.rice > 0 ? <Badge status="Low Stock" /> : <Badge status="Critical" />}
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-700">Wheat</span>
                    {shopStock.wheat >= 10 ? <Badge status="Normal" /> : shopStock.wheat > 0 ? <Badge status="Low Stock" /> : <Badge status="Critical" />}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">Live inventory from Shop #A-14</p>
            </div>

            <div className="bg-teal-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center items-center text-center">
              <div className="bg-teal-500 p-3 rounded-full mb-4 shadow-inner">
                <CalendarCheck size={28} className="text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Request Quota Booking</h3>
              <p className="text-teal-100 text-sm mb-6 px-4">Ask the dealer to pack your items ahead of time. Avoid waiting in long lines.</p>
              <button onClick={() => setIsPrebookOpen(true)} className="px-6 py-3 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-transform active:scale-95 w-full cursor-pointer">
                Send Booking Request
              </button>
            </div>
          </div>

          {myReservations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50"><h3 className="font-bold text-slate-800">My Booking Requests</h3></div>
               <div className="divide-y divide-slate-100">
                 {myReservations.map(res => (
                   <div key={res.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                     <div>
                       <p className="text-sm font-bold text-slate-800">Pickup Date: {res.items.Date}</p>
                       <p className="text-xs text-slate-500">Requested: {res.items.Rice}, {res.items.Wheat}</p>
                     </div>
                     <Badge status={res.payment_status} />
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">My Complaint History</h3>
            <button onClick={() => setIsComplaintOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm cursor-pointer shadow-rose-600/20">
              <MessageSquare size={16}/> File New Complaint
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.length === 0 ? <p className="p-6 text-slate-500">You have no active complaints.</p> : complaints.map(cmp => (
              <div key={cmp.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm text-slate-800 font-medium mb-1">{cmp.complaint_text}</p>
                  <p className="text-xs text-slate-400">Filed on {new Date(cmp.created_at).toLocaleDateString()}</p>
                </div>
                <Badge status={cmp.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isComplaintOpen} onClose={() => setIsComplaintOpen(false)} title="File a Complaint">
        <form onSubmit={submitComplaint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" readOnly value={formData.name} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 outline-none cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Complaint Details</label>
            <textarea required rows="4" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Describe the issue with your ration delivery..."></textarea>
          </div>
          <button type="submit" className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors mt-2">Submit to Authority</button>
        </form>
      </Modal>

      <Modal isOpen={isPrebookOpen} onClose={() => setIsPrebookOpen(false)} title="Schedule Quota Pickup">
        <form onSubmit={handlePrebook} className="space-y-4">
          <div className="p-4 bg-teal-50 text-teal-800 rounded-xl border border-teal-100 mb-4 text-sm font-medium">
            Booking Request: 30kg Rice & 10kg Wheat
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Pickup Date</label>
            <input type="date" required value={prebookData.date} onChange={e => setPrebookData({...prebookData, date: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors mt-4">Send Request to Dealer</button>
        </form>
      </Modal>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [role, setRole] = useState("dealer"); 
  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] font-sans">
        <Sidebar role={role} setRole={setRole} />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto">
          <Topbar role={role} />
          <Routes>
            <Route path="*" element={ 
              role === 'admin' ? <AdminDashboard /> : 
              role === 'warehouse' ? <WarehouseDashboard /> : 
              role === 'citizen' ? <CitizenDashboard /> :
              <DealerDashboard /> 
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
