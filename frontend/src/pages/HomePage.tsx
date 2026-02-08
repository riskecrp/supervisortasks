import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  MessageSquare, 
  Users, 
  Calendar, 
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { useAnalytics } from '../hooks/useAnalytics';

const HomePage = () => {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: analytics?.totalTasks || 0,
      icon: CheckSquare,
      color: 'text-blue-600',
      link: '/tasks',
    },
    {
      title: 'Completed Tasks',
      value: analytics?.completedTasks || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      link: '/tasks',
    },
    {
      title: 'Active Supervisors',
      value: analytics?.activeSupervisors || 0,
      icon: Users,
      color: 'text-purple-600',
      link: '/supervisors',
    },
    {
      title: 'On Leave',
      value: analytics?.supervisorsOnLOA || 0,
      icon: Calendar,
      color: 'text-orange-600',
      link: '/loa',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Supervisor Tasks Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <Icon className={`w-12 h-12 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics?.completionRate?.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${analytics?.completionRate || 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <Badge variant="default">Not Started</Badge>
                  <p className="text-2xl font-bold mt-2">{analytics?.notStartedTasks || 0}</p>
                </div>
                <div>
                  <Badge variant="warning">In Progress</Badge>
                  <p className="text-2xl font-bold mt-2">{analytics?.inProgressTasks || 0}</p>
                </div>
                <div>
                  <Badge variant="success">Completed</Badge>
                  <p className="text-2xl font-bold mt-2">{analytics?.completedTasks || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to="/tasks"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-gray-900">Manage Tasks</span>
              </Link>
              <Link
                to="/discussions"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-gray-900">Track Discussions</span>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-900">View Analytics</span>
              </Link>
              <Link
                to="/loa"
                className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                <span className="font-medium text-gray-900">Manage Leave</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
