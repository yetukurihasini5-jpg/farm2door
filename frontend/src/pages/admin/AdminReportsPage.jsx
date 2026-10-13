import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  Sprout,
  Users,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AdminReportsPage = () => {
  const { addToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = `${startDate}T00:00:00`;
      if (endDate) params.endDate = `${endDate}T23:59:59`;
      if (selectedStatus) params.status = selectedStatus;

      const data = await adminService.getSalesReport(params);
      setReport(data);
    } catch (err) {
      addToast('Failed to load sales report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {};
      if (startDate) params.startDate = `${startDate}T00:00:00`;
      if (endDate) params.endDate = `${endDate}T23:59:59`;
      if (selectedStatus) params.status = selectedStatus;

      const response = await adminService.exportOrdersCsv(params);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farm2door-orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast('CSV sales report downloaded successfully', 'success');
    } catch (err) {
      addToast('Failed to export CSV report', 'error');
    } finally {
      setExporting(false);
    }
  };

  const avgOrderValue =
    report && report.totalOrdersCount > 0
      ? (Number(report.totalSalesAmount) / report.totalOrdersCount).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Sales Reports & Business Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Analyze gross sales volume, top-performing produce varieties, and direct farmer revenue contributions.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Generating CSV...' : 'Export Orders to CSV'}
        </button>
      </div>

      {/* Date & Filter Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm">
        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Order Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing sales analytics..." />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Gross Revenue
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900">
                ₹{(report?.totalSalesAmount || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-stone-400 mt-1">Calculated from filtered orders</p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Total Orders Processed
                </span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900">
                {report?.totalOrdersCount || 0}
              </div>
              <p className="text-xs text-stone-400 mt-1">Orders in selected period</p>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Average Order Value (AOV)
                </span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-stone-900">
                ₹{Number(avgOrderValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-stone-400 mt-1">Average cart ticket size</p>
            </div>
          </div>

          {/* Breakdown Tables Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-black text-stone-900">Top Selling Produce Varieties</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-400">By Sales Volume</span>
              </div>

              {report?.topProducts && report.topProducts.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {report.topProducts.map((tp, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-stone-50/50">
                      <div>
                        <p className="font-bold text-stone-900">{tp.productName}</p>
                        <p className="text-[11px] text-stone-400">
                          Quantity Sold: {tp.quantitySold} units
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-stone-900">
                          ₹{(tp.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <p className="text-[10px] text-stone-400">Total Generated</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400">
                  No product sales breakdown available for this date window.
                </div>
              )}
            </div>

            {/* Top Farmers */}
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-black text-stone-900">Farmer Sales Contributions</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-stone-400">Producer Performance</span>
              </div>

              {report?.farmerSummaries && report.farmerSummaries.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {report.farmerSummaries.map((fs, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-stone-50/50">
                      <div>
                        <p className="font-bold text-stone-900">{fs.farmerName}</p>
                        <p className="text-[11px] text-stone-400">
                          Fulfillment Orders: {fs.ordersCount}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700">
                          ₹{(fs.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <p className="text-[10px] text-stone-400">Producer Volume</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-stone-400">
                  No producer breakdown available for this date window.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
