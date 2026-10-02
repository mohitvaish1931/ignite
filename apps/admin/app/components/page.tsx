"use client";

import React, { useState } from "react";
import {
  EnterpriseDataTable,
  FileUpload,
  StatCard,
  MetricCard,
  ChartCard,
  AreaChart,
  BarChart,
  LineChart,
  Timeline,
  ActivityFeed,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
  Button,
  notify,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  TimelineSkeleton,
  EmptyState,
  ErrorState,
  NotFound,
  PermissionDenied,
} from "@project-organizer/ui";
import { Users, DollarSign, Activity, Settings } from "lucide-react";

const MOCK_DATA = [
  { id: "1", name: "John Doe", role: "Admin", status: "Active" },
  { id: "2", name: "Jane Smith", role: "Organizer", status: "Inactive" },
  { id: "3", name: "Alice Johnson", role: "Participant", status: "Active" },
];

const COLUMNS = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
];

const CHART_DATA = [
  { name: "Jan", users: 400, revenue: 2400 },
  { name: "Feb", users: 300, revenue: 1398 },
  { name: "Mar", users: 200, revenue: 9800 },
  { name: "Apr", users: 278, revenue: 3908 },
  { name: "May", users: 189, revenue: 4800 },
  { name: "Jun", users: 239, revenue: 3800 },
];

const TIMELINE_DATA = [
  {
    id: "1",
    title: "Project Created",
    timestamp: "2 hours ago",
    description: "The hackathon project was created by Admin.",
  },
  {
    id: "2",
    title: "Team Formed",
    timestamp: "1 hour ago",
    description: "Team 'Innovators' was formed with 4 members.",
    metadata: { Members: "4", Track: "AI" },
  },
];

const ACTIVITY_DATA = [
  {
    id: "1",
    actor: { name: "Alice" },
    action: <span>submitted</span>,
    entity: { name: "Final Project" },
    timestamp: "10 mins ago",
  },
  {
    id: "2",
    actor: { name: "Bob" },
    action: <span>commented on</span>,
    entity: { name: "Final Project" },
    timestamp: "5 mins ago",
    metadata: "Great work guys!",
  },
];

export default function ComponentsShowcase() {
  const [chartState, setChartState] = useState<"loading" | "empty" | "error" | "populated">("populated");

  return (
    <div className="space-y-12 p-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Component Showcase</h1>
        <p className="text-muted-foreground">A living documentation of the design system components.</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">1. Data Display (Tables)</h2>
        <EnterpriseDataTable
          data={MOCK_DATA}
          columns={COLUMNS}
          bulkActions={[
            {
              label: "Delete",
              variant: "destructive",
              onClick: (rows) => notify.success(`Deleted ${rows.length} rows`),
            },
          ]}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">2. Forms & Inputs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-medium">File Upload</h3>
            <FileUpload
              onUpload={async (file) => {
                await new Promise((r) => setTimeout(r, 2000));
                notify.success(`Uploaded ${file.name}`);
              }}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">3. Widgets & Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="12,345"
            icon={<Users />}
            trend={{ value: 12, label: "vs last month", isPositive: true }}
          />
          <StatCard
            title="Revenue"
            value="$45,231"
            icon={<DollarSign />}
            trend={{ value: 2.4, label: "vs last month", isPositive: false }}
          />
          <MetricCard
            title="Server Load"
            value="78%"
            progress={78}
            status="warning"
          />
          <MetricCard
            title="Storage Used"
            value="45GB"
            total="100GB"
            progress={45}
            status="success"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2 flex items-center justify-between">
          <span>4. Charts</span>
          <select
            className="text-sm border rounded p-1"
            value={chartState}
            onChange={(e) => setChartState(e.target.value as any)}
          >
            <option value="populated">Populated</option>
            <option value="loading">Loading</option>
            <option value="empty">Empty</option>
            <option value="error">Error</option>
          </select>
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="User Growth (Area)"
            description="Monthly active users"
            state={chartState}
            error={new Error("Failed to fetch data")}
          >
            <AreaChart
              data={CHART_DATA}
              index="name"
              categories={["users"]}
            />
          </ChartCard>
          <ChartCard
            title="Revenue (Bar)"
            description="Monthly revenue"
            state={chartState}
          >
            <BarChart
              data={CHART_DATA}
              index="name"
              categories={["revenue"]}
            />
          </ChartCard>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">5. Timeline & Activity</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border rounded-xl p-6 bg-card/50">
            <h3 className="font-medium mb-6">Timeline</h3>
            <Timeline items={TIMELINE_DATA} />
          </div>
          <div className="border rounded-xl p-6 bg-card/50">
            <h3 className="font-medium mb-6">Activity Feed</h3>
            <ActivityFeed items={ACTIVITY_DATA} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">6. Overlays & Dialogs</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => notify.success("Action successful!")}>Toast (Success)</Button>
          <Button onClick={() => notify.error("Action failed!")} variant="destructive">Toast (Error)</Button>
          
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Drawer Content</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">This is inside the drawer.</div>
              <DrawerFooter>
                <Button>Submit</Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modal Content</DialogTitle>
                <DialogDescription>This is a standard modal.</DialogDescription>
              </DialogHeader>
              <div className="py-4">Modal body goes here.</div>
              <DialogFooter>
                <Button>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground">Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">7. Feedback States</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            title="No Projects Found"
            description="Get started by creating a new project."
            action={{ label: "Create Project", onClick: () => {} }}
          />
          <ErrorState
            title="Connection Lost"
            error={new Error("Network error")}
            onRetry={() => {}}
          />
          <NotFound />
          <PermissionDenied />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">8. Skeletons</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton />
          <ChartSkeleton />
          <div className="col-span-full">
            <TableSkeleton rows={3} />
          </div>
        </div>
      </section>
    </div>
  );
}
