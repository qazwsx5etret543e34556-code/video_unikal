import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Video, 
  Settings, 
  FileText, 
  Shield, 
  Layers 
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/queue', icon: Video, labelKey: 'nav.queue' },
  { path: '/presets', icon: Layers, labelKey: 'nav.presets' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  { path: '/license', icon: Shield, labelKey: 'nav.license' },
  { path: '/logs', icon: FileText, labelKey: 'nav.logs' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-6">
        <h1 className="text-lg font-semibold text-foreground">
          {t('app.title')}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          v{t('app.version')}
        </p>
      </div>
      
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
