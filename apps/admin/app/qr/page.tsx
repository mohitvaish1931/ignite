"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getCheckinLogs, provisionScanner } from "../actions/qr";
import { QrCode } from "lucide-react";

export default function QRCheckinsPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [stats, setStats] = useState({ totalScans: 0, successCount: 0, failedCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getCheckinLogs({ page, pageSize, search });
      if (res.success && res.data) {
        setData(res.data.logs);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
        setStats(res.data.stats);
      } else {
        notify.error(res.error || "Failed to load scan logs");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const [isProvisionModalOpen, setProvisionModalOpen] = useState(false);
  const [scannerName, setScannerName] = useState("");
  const [provisioning, setProvisioning] = useState(false);

  const handleProvisionScanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    const res = await provisionScanner(scannerName);
    if (res.success) {
      notify.success("Scanner provisioned successfully!");
      setProvisionModalOpen(false);
      setScannerName("");
      setRefresh(r => r + 1);
    } else {
      notify.error(res.error || "Failed to provision scanner");
    }
    setProvisioning(false);
  };

  const columns = useMemo(
    () => [
      { 
        accessorKey: "scannerName", 
        header: "Scanner",
        cell: ({ row }: any) => <span className="font-semibold">{row.getValue("scannerName")}</span>
      },
      { accessorKey: "eventName", header: "Event" },
      { 
        accessorKey: "qrType", 
        header: "Pass Type",
        cell: ({ row }: any) => (
          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
            {row.getValue("qrType")}
          </span>
        )
      },
      { accessorKey: "scanType", header: "Action" },
      { 
        accessorKey: "result", 
        header: "Result",
        cell: ({ row }: any) => {
          const val = row.getValue("result");
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              val === 'SUCCESS' ? 'bg-success/20 text-success' : 
              'bg-destructive/20 text-destructive'
            }`}>
              {val}
            </span>
          )
        }
      },
      { accessorKey: "failureReason", header: "Details" },
      { 
        accessorKey: "createdAt", 
        header: "Timestamp",
        cell: ({ row }: any) => new Date(row.getValue("createdAt")).toLocaleString()
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="QR & Check-ins" 
          description="Monitor live scan logs, manage scanner devices, and view check-in statistics."
        />
        <Button onClick={() => setProvisionModalOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" /> Provision Scanner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalScans}</p>
        </div>
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Successful Entry</h3>
          <p className="text-3xl font-bold mt-2 text-success">{stats.successCount}</p>
        </div>
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Failed Scans</h3>
          <p className="text-3xl font-bold mt-2 text-destructive">{stats.failedCount}</p>
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
        bulkActions={[
          {
            label: "Export Logs (CSV)",
            variant: "secondary",
            onClick: (rows) => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "ID,Scanner,Event,Pass Type,Action,Result,Timestamp\n"
                + rows.map((r: any) => `${r.id},${r.scannerName},${r.eventName},${r.qrType},${r.scanType},${r.result},${r.createdAt}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "scan_logs.csv");
              document.body.appendChild(link);
              link.click();
              link.remove();
              notify.success(`Exported ${rows.length} scan logs`);
            },
          },
        ]}
      />

      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm shadow-lg max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Provision Scanner</h3>
            <form onSubmit={handleProvisionScanner} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Scanner Name / Location</label>
                <input 
                  type="text" 
                  value={scannerName}
                  onChange={(e) => setScannerName(e.target.value)}
                  placeholder="e.g. Main Entrance Gate 1" 
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setProvisionModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={provisioning}>
                  {provisioning ? "Provisioning..." : "Provision"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
