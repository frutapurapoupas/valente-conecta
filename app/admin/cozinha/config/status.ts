import { Clock, Package, CheckCircle, Truck, XCircle } from 'lucide-react';

export const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500', next: 'preparing', bg: 'bg-yellow-500/20', border: 'border-yellow-500' },
  preparing: { label: 'Preparando', icon: Package, color: 'bg-blue-500', next: 'ready', bg: 'bg-blue-500/20', border: 'border-blue-500' },
  ready: { label: 'Pronto', icon: CheckCircle, color: 'bg-green-500', next: 'delivered', bg: 'bg-green-500/20', border: 'border-green-500' },
  delivered: { label: 'Entregue', icon: Truck, color: 'bg-gray-500', next: null, bg: 'bg-gray-500/20', border: 'border-gray-500' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-500', next: null, bg: 'bg-red-500/20', border: 'border-red-500' }
};