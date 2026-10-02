"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getUsers } from "../actions/users";
import { Filter } from "lucide-react";

export default function UsersPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getUsers({ page, pageSize, search });
      if (res.success && res.data) {
        setData(res.data.users);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
      } else {
        notify.error(res.error || "Failed to load users");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const columns = useMemo(
    () => [
      { 
        accessorKey: "name", 
        header: "Name",
        cell: ({ row }: any) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=1e293b,334155,475569`} 
                alt={user.name}
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
            </div>
          )
        }
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "eventsJoined", header: "Events Joined" },
      { accessorKey: "hackathons", header: "Hackathons" },
      { accessorKey: "joined", header: "Joined On" },
      { 
        accessorKey: "status", 
        header: "Status",
        cell: ({ row }: any) => {
          const val = row.getValue("status");
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              val === 'Active' ? 'bg-success/20 text-success' : 
              'bg-muted text-muted-foreground'
            }`}>
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
          title="Users" 
          description="Manage organizers, attendees, and system users."
        />
        <Button variant="outline" onClick={() => notify.info("Filters coming soon!")}>
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
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
