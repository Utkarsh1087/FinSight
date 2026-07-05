import React, { useState, useEffect } from 'react';
import {
  Boxes,
  ArrowRightLeft,
  Search,
  FileSpreadsheet,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  X,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Inventory = () => {
  const { isFinanceUser } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    source_warehouse: '',
    target_warehouse: '',
    product: '',
    quantity: 1,
    notes: '',
  });

  useEffect(() => {
    fetchInventoryData();
  }, [selectedWarehouse, search]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      let stockUrl = '/inventory/stock/?';
      if (selectedWarehouse) stockUrl += `warehouse=${selectedWarehouse}&`;
      if (search) stockUrl += `search=${encodeURIComponent(search)}&`;

      const [whRes, stockRes, trfRes, prodRes, valRes] = await Promise.allSettled([
        api.get('/inventory/warehouses/'),
        api.get(stockUrl),
        api.get('/inventory/transfers/'),
        api.get('/inventory/products/'),
        api.get('/inventory/valuation/'),
      ]);

      if (whRes.status === 'fulfilled') setWarehouses(whRes.value.data.results || whRes.value.data || []);
      if (stockRes.status === 'fulfilled') setStocks(stockRes.value.data.results || stockRes.value.data || []);
      if (trfRes.status === 'fulfilled') setTransfers(trfRes.value.data.results || trfRes.value.data || []);
      if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.results || prodRes.value.data || []);
      if (valRes.status === 'fulfilled') setValuation(valRes.value.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (transferData.source_warehouse === transferData.target_warehouse) {
      alert('Source and destination warehouse cannot be the same.');
      return;
    }
    try {
      await api.post('/inventory/transfers/', transferData);
      setTransferModalOpen(false);
      setTransferData({ source_warehouse: '', target_warehouse: '', product: '', quantity: 1, notes: '' });
      fetchInventoryData();
      alert('Stock transfer completed successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Transfer failed.');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-100 shadow-featureShadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-midnight_text tracking-tight">Multi-Warehouse Inventory Tracking</h2>
          <p className="text-xs text-black/60 mt-1">
            Global stock movements across India, USA, and Germany with atomic transfer ledgers and valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isFinanceUser && (
            <button
              onClick={() => setTransferModalOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Stock
            </button>
          )}
          <a
            href="/api/reports/inventory/export-csv/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-full text-xs font-bold bg-[#edf5fc] hover:bg-blue-100 text-midnight_text border border-blue-200 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export Valuation CSV
          </a>
        </div>
      </div>

      {/* Warehouse Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {(valuation?.warehouse_breakdown || []).map((wh) => (
          <div
            key={wh.warehouse_code}
            onClick={() => setSelectedWarehouse(selectedWarehouse === wh.warehouse_code ? '' : wh.warehouse_code)}
            className={`bg-white p-6 rounded-3xl border transition-all cursor-pointer shadow-featureShadow ${
              selectedWarehouse === wh.warehouse_code
                ? 'ring-2 ring-primary border-primary bg-blue-50/20'
                : 'border-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-midnight_text">{wh.warehouse_name}</h4>
                  <span className="text-[11px] text-black/50 uppercase font-mono">{wh.warehouse_code} · {wh.country}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-black/50">Valuation</span>
                <div className="text-lg font-extrabold text-midnight_text">₹{wh.total_value.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-black/50">Units on Hand</span>
                <div className="text-lg font-extrabold text-primary">{wh.total_units} units</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedWarehouse('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedWarehouse === '' ? 'bg-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-black/60 hover:text-midnight_text'
            }`}
          >
            All Warehouses
          </button>
          {warehouses.map((w) => (
            <button
              key={w.code}
              onClick={() => setSelectedWarehouse(w.code)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedWarehouse === w.code ? 'bg-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-black/60 hover:text-midnight_text'
              }`}
            >
              {w.country} ({w.code})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search product SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs text-midnight_text font-medium shadow-xs focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      {/* Stock Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#edf5fc]/50">
          <h3 className="text-sm font-extrabold text-midnight_text flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Warehouse Stock Balances
          </h3>
          <span className="text-xs font-bold text-black/50">Total Items: {stocks.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Warehouse</th>
                <th className="py-4 px-6">Product & SKU</th>
                <th className="py-4 px-6 text-right">Unit Cost</th>
                <th className="py-4 px-6 text-right">On Hand</th>
                <th className="py-4 px-6 text-right">Total Valuation</th>
                <th className="py-4 px-6">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-black/40 font-medium">
                    No stock rows found.
                  </td>
                </tr>
              ) : (
                stocks.map((s) => (
                  <tr key={s.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-midnight_text">
                      <div>{s.warehouse_name}</div>
                      <span className="text-[10px] text-black/40 font-mono font-normal">{s.warehouse_code}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-midnight_text">
                      <div>{s.product_name}</div>
                      <span className="text-[10px] font-mono text-primary font-normal">{s.product_sku}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-black/70">
                      ₹{Number(s.unit_cost).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-extrabold text-midnight_text text-sm">
                      {s.quantity_on_hand}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-extrabold text-primary">
                      ₹{Number(s.total_valuation).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      {s.quantity_on_hand < 10 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transfer History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-featureShadow overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-[#edf5fc]/50">
          <h3 className="text-sm font-extrabold text-midnight_text flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" /> Recent Inter-Warehouse Transfers
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#edf5fc] text-midnight_text font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6">Source → Target</th>
                <th className="py-4 px-6 text-right">Quantity</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-black/40 font-medium">
                    No transfers recorded yet.
                  </td>
                </tr>
              ) : (
                transfers.map((trf) => (
                  <tr key={trf.id} className="hover:bg-[#edf5fc]/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-primary">{trf.reference_no}</td>
                    <td className="py-4 px-6 font-bold text-midnight_text">{trf.product_name} ({trf.product_sku})</td>
                    <td className="py-4 px-6 font-medium text-black/70">
                      {trf.source_wh_name} → <span className="text-emerald-600 font-bold">{trf.target_wh_name}</span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-midnight_text">{trf.quantity} units</td>
                    <td className="py-4 px-6 text-black/50">{trf.transfer_date}</td>
                    <td className="py-4 px-6"><StatusBadge status={trf.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-midnight_text/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleExecuteTransfer} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-midnight_text">Inter-Warehouse Transfer</h3>
              <button type="button" onClick={() => setTransferModalOpen(false)} className="text-black/50 hover:text-midnight_text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Product</label>
              <select
                required
                value={transferData.product}
                onChange={(e) => setTransferData({ ...transferData, product: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select Product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Source Warehouse</label>
                <select
                  required
                  value={transferData.source_warehouse}
                  onChange={(e) => setTransferData({ ...transferData, source_warehouse: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">From...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-midnight_text mb-1">Destination Warehouse</label>
                <select
                  required
                  value={transferData.target_warehouse}
                  onChange={(e) => setTransferData({ ...transferData, target_warehouse: e.target.value })}
                  className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">To...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Quantity to Transfer</label>
              <input
                type="number"
                min="1"
                required
                value={transferData.quantity}
                onChange={(e) => setTransferData({ ...transferData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-midnight_text mb-1">Transfer Notes / Logistics Ref</label>
              <textarea
                rows="2"
                placeholder="Logistics tracking number or operational rationale..."
                value={transferData.notes}
                onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                className="w-full bg-[#edf5fc] border border-slate-200 rounded-xl px-3 py-2 text-xs text-midnight_text focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-black/60 hover:text-midnight_text"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Inventory;
