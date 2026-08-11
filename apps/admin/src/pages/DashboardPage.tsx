import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Activity, Key, Users, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const cards = [
    {
      title: 'Total Licenses',
      value: stats?.totalLicenses ?? 0,
      icon: Key,
      color: 'text-blue-500',
    },
    {
      title: 'Active Licenses',
      value: stats?.activeLicenses ?? 0,
      icon: Activity,
      color: 'text-green-500',
    },
    {
      title: 'Total Activations',
      value: stats?.totalActivations ?? 0,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Audit Events',
      value: stats?.auditEvents ?? 0,
      icon: FileText,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
