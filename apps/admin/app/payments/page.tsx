"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getPayments } from "../actions/payments";
import { Filter, IndianRupee, ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function PaymentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [stats, setStats] = useState({ totalRevenue: 0, successful: 0, refunded: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getPayments({ page, pageSize, search });
      if (res.success && res.data) {
        const transformed = res.data.payments.map((p: any) => ({
          id: p.publicId,
          user: p.userName,
          event: p.eventName,
          amount: `₹${p.amount}`,
          date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: p.status === "COMPLETED" ? "Success" : p.status === "PENDING" ? "Pending" : "Refunded"
        }));
        
        setData(transformed);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
        
        // Count for stats from all payments (this would ideally be from backend stats but we'll approximate for demo)
        const all = res.data.payments;
        setStats({
          totalRevenue: res.data.totalRevenue || 0,
          successful: all.filter((p: any) => p.status === "COMPLETED").length,
          refunded: all.filter((p: any) => p.status === "REFUNDED" || p.status === "FAILED").length
        });
      } else {
        notify.error(res.error || "Failed to load payments");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "Transaction ID", cell: ({ row }: any) => <span className="font-mono text-slate-300">{row.getValue("id")}</span> },
      { accessorKey: "user", header: "User", cell: ({ row }: any) => <span className="font-medium text-slate-200">{row.getValue("user")}</span> },
      { accessorKey: "event", header: "Event/Hackathon" },
      { accessorKey: "amount", header: "Amount", cell: ({ row }: any) => <span className="font-medium text-slate-100">{row.getValue("amount")}</span> },
      { accessorKey: "date", header: "Date" },
      { 
        accessorKey: "status", 
        header: "Status",
        cell: ({ row }: any) => {
          const val = row.getValue("status");
          return (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1.5 w-max ${
              val === 'Success' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
              val === 'Pending' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
              'text-red-400 bg-red-400/10 border-red-400/20'
            }`}>
              {val === 'Success' && <CheckCircle2 className="w-3 h-3" />}
              {val === 'Pending' && <Clock className="w-3 h-3" />}
              {val === 'Refunded' && <XCircle className="w-3 h-3" />}
              {val}
            </span>
          )
        }
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Payments" 
          description="View transactions, revenue, and handle refunds."
        />
        <Button variant="outline" onClick={() => notify.info("Filters coming soon!")}>
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-6">
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-card shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <IndianRupee className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">₹{stats.totalRevenue.toLocaleString()}</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 18.2% vs last 30 days
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.07] bg-card shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Successful Payments</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">{stats.successful}</p>
              <span className="text-xs font-medium text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 12.5% vs last 30 days
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-white/[0.07] bg-card shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-400">Refunds</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-slate-100">{stats.refunded}</p>
              <span className="text-xs font-medium text-red-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" /> 5.3% vs last 30 days
              </span>
            </div>
          </div>
        </div>
      </div>

      <EnterpriseDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        pageCount={pageCount}
        onSearch={setSearch}
        onPaginationChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
      />
    </div>
  );
}
