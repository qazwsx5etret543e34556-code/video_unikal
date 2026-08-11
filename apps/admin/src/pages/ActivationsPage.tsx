import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function ActivationsPage() {
  const queryClient = useQueryClient();

  const { data: activationsData, isLoading } = useQuery({
    queryKey: ['admin-activations'],
    queryFn: () => adminApi.getActivations({ page: 1, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activations'] });
      toast.success('Activation deleted');
    },
    onError: () => toast.error('Failed to delete activation'),
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Activations</h1>
      <div className="space-y-4">
        {activationsData?.activations.map((activation: any) => (
          <Card key={activation.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="font-mono text-sm">{activation.licenseId}</div>
                  <div className="text-sm text-gray-500">HWID: {activation.hwid}</div>
                  <div className="text-sm text-gray-500">
                    Activated: {new Date(activation.activatedAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Last Seen: {new Date(activation.lastSeenAt).toLocaleString()}
                  </div>
                  {activation.ipAddress && (
                    <div className="text-sm text-gray-500">IP: {activation.ipAddress}</div>
                  )}
                  {activation.userAgent && (
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      User Agent: {activation.userAgent}
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(activation.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
