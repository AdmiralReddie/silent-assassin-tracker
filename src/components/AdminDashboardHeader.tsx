
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdminDashboardHeaderProps {
  onRefresh?: () => void;
  onLogout: () => void;
  refreshing?: boolean;
}

const AdminDashboardHeader = ({ 
  onRefresh, 
  onLogout, 
  refreshing = false 
}: AdminDashboardHeaderProps) => {
  const handleLogout = () => {
    localStorage.removeItem('admin-logged-in');
    onLogout();
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    await onRefresh();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <div className="flex gap-2">
        <Button 
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          Ausloggen
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
