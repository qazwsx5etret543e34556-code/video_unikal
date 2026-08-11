import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Search, Trash2, RefreshCw, Copy } from 'lucide-react';

export default function LicensesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: licensesData, isLoading } = useQuery({
    queryKey: ['admin-licenses', page, search, status],
    queryFn: () => adminApi.getLicenses({ page, limit: 10, search, status: status || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
      setIsCreateOpen(false);
      toast.success('License created');
    },
    onError: () => toast.error('Failed to create license'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-licenses'] });
      toast.success('License deleted');
    },
    onError: () => toast.error('Failed to delete license'),
  });

  const regenerateMutation = useMutation({
    mutationFn: adminApi.regenerateKey,
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.newKey);
      toast.success('New key copied to clipboard');
    },
    onError: () => toast.error('Failed to regenerate key'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      type: formData.get('type') as 'ONE_TIME' | 'SUBSCRIPTION',
      maxActivations: Number(formData.get('maxActivations')) || 2,
      expiresAt: formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string).toISOString() : undefined,
      note: formData.get('note') as string || undefined,
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Licenses</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create License
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New License</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select name="type" className="w-full p-2 border rounded" required>
                  <option value="ONE_TIME">One-Time ($50)</option>
                  <option value="SUBSCRIPTION">Subscription</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Activations</label>
                <Input name="maxActivations" type="number" defaultValue={2} min={1} max={10} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expires At (optional)</label>
                <Input name="expiresAt" type="datetime-local" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <Input name="note" type="text" />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by key or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="REVOKED">Revoked</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {licensesData?.licenses.map((license: any) => (
            <Card key={license.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="font-mono text-sm">{license.key}</div>
                    <div className="text-sm text-gray-500">
                      Type: {license.type} | Status: {license.status} | Activations: {license._count?.activations ?? 0}/{license.maxActivations}
                    </div>
                    {license.note && <div className="text-sm text-gray-600">Note: {license.note}</div>}
                    {license.expiresAt && (
                      <div className="text-sm text-gray-500">
                        Expires: {new Date(license.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateMutation.mutate(license.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(license.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
