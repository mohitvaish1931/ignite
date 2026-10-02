"use client";

import React, { useEffect, useState, useMemo } from "react";
import { EnterpriseDataTable, PageHeader, notify, Button } from "@project-organizer/ui";
import { getJudgingOverview, assignJudgeToSubmission, createScorecardTemplate, markSubmissionsUnderReview } from "../actions/judging";
import { Users } from "lucide-react";

export default function JudgingPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [stats, setStats] = useState({ totalSubmissions: 0, scoredSubmissions: 0, pendingSubmissions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getJudgingOverview({ page, pageSize, search });
      if (res.success && res.data) {
        setData(res.data.submissions);
        setTotal(res.data.total);
        setPageCount(res.data.pageCount);
        setStats(res.data.stats);
      } else {
        notify.error(res.error || "Failed to load judging data");
      }
      setIsLoading(false);
    }
    load();
  }, [page, pageSize, search, refresh]);

  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [judgeEmail, setJudgeEmail] = useState("");
  const [judgePassword, setJudgePassword] = useState("");
  const [assigning, setAssigning] = useState(false);

  // We can add a Row Action inside columns
  const columns = useMemo(
    () => [
      { 
        accessorKey: "teamName", 
        header: "Team Name",
        cell: ({ row }: any) => <span className="font-semibold">{row.getValue("teamName")}</span>
      },
      { 
        accessorKey: "trackName", 
        header: "Track",
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.getValue("trackName")}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={row.original.problemStatement}>
              {row.original.problemStatement}
            </span>
          </div>
        )
      },
      { 
        accessorKey: "status", 
        header: "Status",
        cell: ({ row }: any) => {
          const val = row.getValue("status");
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              val === 'SCORED' || val === 'WINNER' ? 'bg-success/20 text-success' : 
              val === 'UNDER_REVIEW' ? 'bg-primary/20 text-primary' : 
              'bg-muted text-muted-foreground'
            }`}>
              {val}
            </span>
          )
        }
      },
      { 
        accessorKey: "judges", 
        header: "Assigned Judges",
        cell: ({ row }: any) => {
          const judges = row.original.judges || [];
          if (judges.length === 0) return <span className="text-xs text-muted-foreground">Unassigned</span>;
          return (
            <div className="flex -space-x-2 overflow-hidden">
              {judges.map((j: any, i: number) => (
                <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center text-xs font-medium" title={`${j.name} (${j.status})`}>
                  {j.name.charAt(0)}
                </div>
              ))}
            </div>
          )
        }
      },
      { 
        accessorKey: "totalScore", 
        header: "Avg Score",
        cell: ({ row }: any) => {
          const val = row.getValue("totalScore");
          return (
            <span className={`font-bold ${val !== '-' ? 'text-primary' : 'text-muted-foreground'}`}>
              {val !== '-' ? val : 'N/A'}
            </span>
          )
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedSubmissionId(row.original.id);
              setAssignModalOpen(true);
            }}
          >
            <Users className="w-4 h-4 mr-1" /> Assign
          </Button>
        )
      }
    ],
    []
  );

  const handleAssignJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeEmail || !selectedSubmissionId) return;
    setAssigning(true);
    const res = await assignJudgeToSubmission(selectedSubmissionId, judgeEmail, judgePassword);
    if (res.success) {
      notify.success(`Assigned judge ${judgeEmail} successfully!`);
      setAssignModalOpen(false);
      setJudgeEmail("");
      setJudgePassword("");
      setRefresh(r => r + 1);
    } else {
      notify.error(res.error || "Failed to assign judge");
    }
    setAssigning(false);
  };

  const [isRubricModalOpen, setRubricModalOpen] = useState(false);
  const [rubricName, setRubricName] = useState("");
  const [criteria, setCriteria] = useState([{ name: "Innovation", maxScore: 30, weight: 0.3 }]);
  const [creatingRubric, setCreatingRubric] = useState(false);

  const handleAddCriterion = () => {
    setCriteria([...criteria, { name: "", maxScore: 10, weight: 0.1 }]);
  };

  const handleCreateRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRubric(true);
    const res = await createScorecardTemplate("", rubricName, criteria);
    if (res.success) {
      notify.success(`Created Rubric: ${rubricName} with ${criteria.length} criteria.`);
      setRubricModalOpen(false);
      setRubricName("");
    } else {
      notify.error(res.error || "Failed to create rubric");
    }
    setCreatingRubric(false);
  };

  return (
    <div className="w-full space-y-6 relative">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Judging Dashboard" 
          description="Monitor hackathon submissions, assign judges, and track scoring progress."
        />
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setRubricModalOpen(true)}>
            Create Rubric
          </Button>
          <Button onClick={() => notify.info("To assign a judge, click the Assign button on a specific submission row.")}>
            <Users className="mr-2 h-4 w-4" /> Manage Judges
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Submissions</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalSubmissions}</p>
        </div>
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Scored</h3>
          <p className="text-3xl font-bold mt-2 text-success">{stats.scoredSubmissions}</p>
        </div>
        <div className="p-6 border rounded-md bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Review</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{stats.pendingSubmissions}</p>
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
            label: "Mark Under Review",
            variant: "secondary",
            onClick: async (rows) => {
              const res = await markSubmissionsUnderReview(rows.map((r: any) => r.id));
              if (res.success) {
                notify.success(`Marked ${res.count} submissions as Under Review`);
                setRefresh(r => r + 1);
              } else {
                notify.error(res.error || "Failed");
              }
            },
          },
        ]}
      />

      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-sm shadow-lg max-h-[90dvh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Assign Judge</h3>
            <form onSubmit={handleAssignJudge} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Judge Email</label>
                <input 
                  type="email" 
                  value={judgeEmail}
                  onChange={(e) => setJudgeEmail(e.target.value)}
                  placeholder="judge@company.com" 
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Set Password (If New Judge)</label>
                <input 
                  type="password" 
                  value={judgePassword}
                  onChange={(e) => setJudgePassword(e.target.value)}
                  placeholder="Leave empty to auto-generate" 
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" type="button" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={assigning}>
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRubricModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90dvh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Create Marking Scheme</h3>
            <p className="text-sm text-muted-foreground mb-6">Define the criteria judges will use to evaluate submissions.</p>
            
            <form onSubmit={handleCreateRubric} className="space-y-6">
              <div>
                <label className="text-sm font-medium block mb-1">Rubric Name</label>
                <input 
                  type="text" 
                  value={rubricName}
                  onChange={(e) => setRubricName(e.target.value)}
                  placeholder="e.g. Standard Web3 Hackathon Rubric" 
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium">Evaluation Criteria</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCriterion}>+ Add Criterion</Button>
                </div>
                
                <div className="space-y-3">
                  {criteria.map((c, index) => (
                    <div key={index} className="flex gap-3 items-center bg-muted/50 p-3 rounded-md border">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={c.name}
                          onChange={(e) => {
                            const newCriteria = [...criteria];
                            newCriteria[index].name = e.target.value;
                            setCriteria(newCriteria);
                          }}
                          placeholder="Criterion Name (e.g. Design)" 
                          required
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          value={c.maxScore}
                          onChange={(e) => {
                            const newCriteria = [...criteria];
                            newCriteria[index].maxScore = parseInt(e.target.value);
                            setCriteria(newCriteria);
                          }}
                          placeholder="Max pts" 
                          required
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          step="0.01"
                          value={c.weight}
                          onChange={(e) => {
                            const newCriteria = [...criteria];
                            newCriteria[index].weight = parseFloat(e.target.value);
                            setCriteria(newCriteria);
                          }}
                          placeholder="Weight (0.1)" 
                          required
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive px-2"
                        onClick={() => {
                          const newCriteria = [...criteria];
                          newCriteria.splice(index, 1);
                          setCriteria(newCriteria);
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => setRubricModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creatingRubric}>
                  {creatingRubric ? "Creating..." : "Save Marking Scheme"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
