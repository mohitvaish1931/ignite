"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getEvents, toggleEventVisibility, toggleEventState } from "../actions/events";
import { Plus, Eye, EyeOff, Edit, Rocket, ArchiveX } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
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
      const res = await getEvents({ page, pageSize, search });
      if (res.success && res.data) {
        setData(res.data.events);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
      } else {
        notify.error(res.error || "Failed to load events");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const columns = useMemo(
    () => [
      { 
        accessorKey: "name", 
        header: "Event Name",
        cell: ({ row }: any) => <span className="font-semibold">{row.getValue("name")}</span>
      },
      { accessorKey: "date", header: "Date" },
      { accessorKey: "organizer", header: "Organizer" },
      { accessorKey: "participants", header: "Participants" },
      { 
        accessorKey: "status", 
        header: "Status",
        cell: ({ row }: any) => {
          const val = row.getValue("status");
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              val === 'Live' ? 'bg-success/20 text-success' : 
              val === 'Upcoming' ? 'bg-primary/20 text-primary' : 
              'bg-muted text-muted-foreground'
            }`}>
              {val}
            </span>
          )
        }
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          const isPublic = row.original.visibility === "PUBLIC";
          const isPublished = row.original.state === "PUBLISHED";
          
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const res = await toggleEventState(row.original.id, row.original.state);
                  if (res.success) {
                    notify.success(res.state === "PUBLISHED" ? "Event is now Live (Published)" : "Event moved to Draft");
                    setRefresh(prev => prev + 1);
                  } else {
                    notify.error(res.error || "Failed to toggle state");
                  }
                }}
                title={isPublished ? "Make Draft" : "Publish (Make Live)"}
                className={`p-2 rounded-md transition-colors ${
                  isPublished 
                    ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20" 
                    : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20"
                }`}
              >
                {isPublished ? <Rocket className="w-4 h-4" /> : <ArchiveX className="w-4 h-4" />}
              </button>

              <button
                onClick={async () => {
                  const res = await toggleEventVisibility(row.original.id, row.original.visibility);
                  if (res.success) {
                    notify.success(res.visibility === "PUBLIC" ? "Event is now visible to public" : "Event hidden from public");
                    setRefresh(prev => prev + 1);
                  } else {
                    notify.error(res.error || "Failed to toggle visibility");
                  }
                }}
                title={isPublic ? "Make Private" : "Make Public"}
                className={`p-2 rounded-md transition-colors ${
                  isPublic 
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20" 
                    : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border border-slate-500/20"
                }`}
              >
                {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <Link
                href={`/events/${row.original.id}/edit`}
                title="Edit Event"
                className="p-2 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          );
        }
      },
    ],
    [setRefresh]
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Events" 
          description="Manage all events, hackathons, and webinars."
        />
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </Link>
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
