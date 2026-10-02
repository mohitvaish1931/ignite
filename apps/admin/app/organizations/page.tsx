"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getOrganizations, createOrganization, changeOrganizationPlan, updateOrganizationLogo } from "../actions/organizations";
import { Building2 } from "lucide-react";

export default function OrganizationsPage() {
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
      const res = await getOrganizations({ page, pageSize, search });
      if (res.success && res.data) {
        setData(res.data.organizations);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
      } else {
        notify.error(res.error || "Failed to load organizations");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [creating, setCreating] = useState(false);
  
  const [isLogoModalOpen, setLogoModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await createOrganization(orgName, orgDomain);
    if (res.success) {
      notify.success("Organization created successfully");
      setCreateModalOpen(false);
      setOrgName("");
      setOrgDomain("");
      setRefresh(r => r + 1);
    } else {
      notify.error(res.error || "Failed to create organization");
    }
    setCreating(false);
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !logoFile) return;
    
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("logoFile", logoFile);
    
    const res = await updateOrganizationLogo(selectedOrgId, formData);
    if (res.success) {
      notify.success("Logo updated successfully");
      setLogoModalOpen(false);
      setLogoFile(null);
      setSelectedOrgId(null);
      setRefresh(r => r + 1);
    } else {
      notify.error(res.error || "Failed to update logo");
    }
    setUploadingLogo(false);
  };

  const columns = useMemo(
    () => [
      { 
        accessorKey: "name", 
        header: "Organization Name",
        cell: ({ row }: any) => <span className="font-semibold">{row.getValue("name")}</span>
      },
      { accessorKey: "slug", header: "Slug" },
      { accessorKey: "domain", header: "Domain" },
      { 
        accessorKey: "plan", 
        header: "Plan",
        cell: ({ row }: any) => {
          const val = row.getValue("plan");
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              val === 'ENTERPRISE' ? 'bg-primary/20 text-primary' : 
              val === 'PROFESSIONAL' ? 'bg-success/20 text-success' : 
              'bg-muted text-muted-foreground'
            }`}>
              {val}
            </span>
          )
        }
      },
      { 
        accessorKey: "usersCount", 
        header: "Users",
      },
      { 
        accessorKey: "eventsCount", 
        header: "Events",
      },
      { 
        accessorKey: "createdAt", 
        header: "Created",
        cell: ({ row }: any) => new Date(row.getValue("createdAt")).toLocaleDateString()
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Organizations" 
          description="Manage tenants, domains, and subscription plans across the platform."
        />
        <Button onClick={() => setCreateModalOpen(true)}>
          <Building2 className="mr-2 h-4 w-4" /> Create Org
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
        bulkActions={[
          {
            label: "Upgrade to Professional",
            variant: "secondary",
            onClick: async (rows) => {
              const res = await changeOrganizationPlan(rows.map((r: any) => r.id), "PROFESSIONAL");
              if (res.success) {
                notify.success(`Upgraded ${res.count} organizations to Professional`);
                setRefresh(r => r + 1);
              } else {
                notify.error(res.error || "Failed");
              }
            },
          },
          {
            label: "Upgrade to Enterprise",
            variant: "secondary",
            onClick: async (rows) => {
              const res = await changeOrganizationPlan(rows.map((r: any) => r.id), "ENTERPRISE");
              if (res.success) {
                notify.success(`Upgraded ${res.count} organizations to Enterprise`);
                setRefresh(r => r + 1);
              } else {
                notify.error(res.error || "Failed");
              }
            },
          },
          {
            label: "Set Logo",
            variant: "secondary",
            onClick: async (rows) => {
              if (rows.length !== 1) {
                notify.error("Please select exactly one organization to update its logo.");
                return;
              }
              setSelectedOrgId(rows[0].id);
              setLogoModalOpen(true);
            },
          }
        ]}
      />

      {isLogoModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm shadow-lg max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Upload Organization Logo</h3>
            <form onSubmit={handleUploadLogo} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Logo Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  required
                  className="w-full flex rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => {
                  setLogoModalOpen(false);
                  setLogoFile(null);
                  setSelectedOrgId(null);
                }}>Cancel</Button>
                <Button type="submit" disabled={uploadingLogo || !logoFile}>
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm shadow-lg max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Create Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp" 
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Domain (Optional)</label>
                <input 
                  type="text" 
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  placeholder="acme.com" 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
