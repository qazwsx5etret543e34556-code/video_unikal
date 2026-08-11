import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';

export default function AuditLogPage() {
  const { data: auditData, isLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: () => adminApi.getAuditLog({ page: 1, limit: 100 }),
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Audit Log</h1>
      <div className="space-y-2">
        {auditData?.logs.map((log: any) => (
          <Card key={log.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium">{log.action}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  {log.details && (
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto max-w-2xl">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                  {log.ip && (
                    <div className="text-xs text-gray-400">IP: {log.ip}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
