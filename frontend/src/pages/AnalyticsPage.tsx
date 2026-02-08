import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { useAnalytics } from '../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AnalyticsPage = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  const taskStatusData = [
    { name: 'Not Started', value: analytics?.notStartedTasks || 0 },
    { name: 'In Progress', value: analytics?.inProgressTasks || 0 },
    { name: 'Completed', value: analytics?.completedTasks || 0 },
  ];

  const supervisorStatusData = [
    { name: 'Active', value: analytics?.activeSupervisors || 0 },
    { name: 'On LOA', value: analytics?.supervisorsOnLOA || 0 },
  ];

  const topPerformers = [...(analytics?.supervisorMetrics || [])]
    .sort((a, b) => b.totalCompleted - a.totalCompleted)
    .slice(0, 10);

  const weeklyPerformance = [...(analytics?.supervisorMetrics || [])]
    .sort((a, b) => b.thisWeek - a.thisWeek)
    .slice(0, 10);

  const COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Analytics</h1>
        <p className="text-gray-400 mt-2">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Total Tasks</p>
              <p className="text-4xl font-bold text-blue-400 mt-2">
                {analytics?.totalTasks || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Completed</p>
              <p className="text-4xl font-bold text-green-400 mt-2">
                {analytics?.completedTasks || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">In Progress</p>
              <p className="text-4xl font-bold text-yellow-400 mt-2">
                {analytics?.inProgressTasks || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Completion Rate</p>
              <p className="text-4xl font-bold text-purple-400 mt-2">
                {analytics?.completionRate?.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supervisor Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supervisorStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {supervisorStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers - Total Completed Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topPerformers} margin={{ bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCompleted" fill="#3b82f6" name="Total Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>This Week's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyPerformance} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="thisWeek" fill="#22c55e" name="This Week" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={topPerformers.slice(0, 5)} margin={{ bottom: 20, left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="thisMonth" stroke="#8b5cf6" name="This Month" />
                <Line type="monotone" dataKey="thisWeek" stroke="#22c55e" name="This Week" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supervisor Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[300px]">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    This Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    This Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Avg. Days to Complete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {analytics?.supervisorMetrics?.map((supervisor) => (
                  <tr key={supervisor.name} className={supervisor.onLOA ? 'bg-orange-900' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 min-w-[300px]">
                      {supervisor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {supervisor.totalCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {supervisor.thisMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {supervisor.thisWeek}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                      {supervisor.averageCompletionDays.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {supervisor.onLOA ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900 text-orange-200">
                          On LOA
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
