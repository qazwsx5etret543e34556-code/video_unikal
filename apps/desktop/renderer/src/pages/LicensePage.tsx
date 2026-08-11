import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLicense } from '@/hooks/useLicense';
import { Shield, Key, LogOut, RefreshCw } from 'lucide-react';
import { ipcRenderer } from 'electron';

export function LicensePage() {
  const { t } = useTranslation();
  const { license, status, validateLicense, isLoading } = useLicense();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleValidate = async () => {
    setIsVerifying(true);
    try {
      await validateLicense();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm(t('license.confirmDeactivate'))) return;
    
    try {
      await ipcRenderer.invoke('license:deactivate');
    } catch (error) {
      console.error('Deactivation failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'offline':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return t('license.status.active');
      case 'offline':
        return t('license.status.offline');
      case 'expired':
        return t('license.status.expired');
      case 'inactive':
        return t('license.status.inactive');
      default:
        return t('license.status.unknown');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('license.title')}</h1>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('license.status.title')}
          </CardTitle>
          <CardDescription>{t('license.status.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t('license.status.current')}
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor()}`}>
                <span className="font-medium">{getStatusText()}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={isLoading || isVerifying}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
              {t('license.validate')}
            </Button>
          </div>

          {status === 'offline' && license?.offlineExpiresAt && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>{t('license.offlineMode')}</strong> {t('license.offlineUntil')}:{' '}
                {new Date(license.offlineExpiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Details */}
      {license && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t('license.details.title')}
            </CardTitle>
            <CardDescription>{t('license.details.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('license.details.type')}</p>
                <p className="font-medium">
                  {license.type === 'ONE_TIME' ? t('license.type.oneTime') : t('license.type.subscription')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">{t('license.details.key')}</p>
                <p className="font-mono text-sm">{license.key}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">{t('license.details.activations')}</p>
                <p className="font-medium">
                  {license.activationsCount} / {license.maxActivations}
                </p>
              </div>
              
              {license.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('license.details.expiresAt')}</p>
                  <p className="font-medium">{new Date(license.expiresAt).toLocaleDateString()}</p>
                </div>
              )}
              
              {license.activatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('license.details.activatedAt')}</p>
                  <p className="font-medium">{new Date(license.activatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {!license ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('license.activate.title')}</CardTitle>
            <CardDescription>{t('license.activate.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('license.activate.instructions')}
            </p>
            <Button className="w-full">
              <Key className="w-4 h-4 mr-2" />
              {t('license.activate.button')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              {t('license.deactivate.title')}
            </CardTitle>
            <CardDescription>{t('license.deactivate.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('license.deactivate.warning')}
            </p>
            <Button variant="destructive" onClick={handleDeactivate}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('license.deactivate.button')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
