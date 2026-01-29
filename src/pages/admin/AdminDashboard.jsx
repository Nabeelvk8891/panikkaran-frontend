import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAdminDashboard } from "../../services/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminDashboard().then((res) => setStats(res.data));
  }, []);

  if (!stats) return null;

  const { cards, charts } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Admin Dashboard
      </h1>

      {/* ================= STATS ROW 1 ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Total Users" value={cards.totalUsers} />
        <Stat title="Total Jobs" value={cards.totalJobs} />
        <Stat title="Active Jobs" value={cards.activeJobs} />
        <Stat title="Jobs Today" value={cards.jobsToday} />
      </div>

      {/* ================= STATS ROW 2 ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat title="Blocked Users" value={cards.blockedUsers} />
        <Stat title="Blocked Jobs" value={cards.blockedJobs} />
        <Stat title="Verified Users" value={cards.verifiedUsers} />
        <Stat title="Users This Week" value={cards.usersThisWeek} />
      </div>

      {/* ================= GROWTH CHART ================= */}
      <ChartCard title="Users vs Jobs Growth (Last 7 Days)">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={charts.usersVsJobs}>
            <XAxis dataKey="day" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#16a34a"
              strokeWidth={3}
              name="Users"
            />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke="#2563eb"
              strokeWidth={3}
              name="Jobs"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ================= SECONDARY CHARTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Status */}
        <ChartCard title="Job Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.jobStatus}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Verification */}
        <ChartCard title="User Verification Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={charts.userVerification}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#16a34a" />
                <Cell fill="#facc15" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ================= TOP CATEGORIES ================= */}
      <ChartCard title="Top Job Categories">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={charts.topCategories}>
            <XAxis dataKey="_id" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#9333ea" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ================= ATTENTION PANEL ================= */}
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium mb-3">Needs Attention</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• {cards.blockedUsers} blocked users</li>
          <li>• {cards.blockedJobs} blocked jobs</li>
          <li>• {cards.unverifiedUsers} unverified users</li>
          <li>• {cards.jobsThisWeek} jobs posted this week</li>
        </ul>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <h2 className="text-xl sm:text-2xl font-bold mt-1">
        {value}
      </h2>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-4 sm:p-5">
      <h3 className="text-sm font-medium mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
