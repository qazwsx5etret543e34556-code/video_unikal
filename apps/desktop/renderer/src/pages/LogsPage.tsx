import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

export function LogsPage() {
  const { t } = useTranslation();

  // Mock logs - in real app, fetch from IPC
  const logs = [
    { id: '1', level: 'info', message: 'Application started', timestamp: new Date().toISOString() },
    { id: '2', level: 'info', message: 'License validated successfully', timestamp: new Date().toISOString() },
    { id: '3', level: 'warn', message: 'GPU not detected, using CPU encoding', timestamp: new Date().toISOString() },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50';
      case 'warn':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('logs.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('logs.recent')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${getLevelColor(log.level)}`}
              >
                {getLevelIcon(log.level)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('logs.fullPath')}: %APPDATA%\video-uniqueizer\logs\main.log
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
