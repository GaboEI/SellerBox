'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TFunction } from 'i18next';
import { cn } from '@/lib/utils';
import type { SaleWithBookData, Sale, SaleStatus } from '@/lib/types';
import { updateSaleStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CellStatusEditableProps {
  sale: SaleWithBookData;
  isClient: boolean;
  t: TFunction;
  onSaleUpdate: (saleId: string, updatedData: Partial<Sale>) => void;
  statusVariantMap: Record<
    SaleStatus,
    'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  >;
}

export function CellStatusEditable({
  sale,
  isClient,
  t,
  onSaleUpdate,
  statusVariantMap,
}: CellStatusEditableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<SaleStatus>(sale.status);

  useEffect(() => {
    setCurrentStatus(sale.status);
  }, [sale.status]);

  const isFinalState =
    currentStatus === 'completed' || currentStatus === 'canceled' || currentStatus === 'sold_in_person';

  const handleDoubleClick = () => {
    if (sale.status !== 'completed' && sale.status !== 'canceled' && sale.status !== 'sold_in_person') {
      setIsEditing(true);
    }
  };
  
  const handleStatusChange = async (newStatus: SaleStatus) => {
    setIsEditing(false);
    if (newStatus === currentStatus) return;

    // If the new status requires an amount, redirect to edit page
    if (newStatus === 'completed' || newStatus === 'sold_in_person') {
        router.push(`/sales/edit/${sale.id}`);
        return;
    }

    // Optimistic update for non-final states
    setCurrentStatus(newStatus);
    onSaleUpdate(sale.id, { status: newStatus });
    
    // Server action
    const result = await updateSaleStatus(sale.id, newStatus);

    if (result?.error) {
      // Revert on error
      setCurrentStatus(sale.status);
      onSaleUpdate(sale.id, { status: sale.status });
      toast({
        title: t('error'),
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        description: t('update_sale_success'),
      });
    }
  };

  if (isEditing) {
    return (
      <div className="flex justify-center">
        <Select
          defaultValue={currentStatus}
          onValueChange={handleStatusChange}
          onOpenChange={(open) => !open && setIsEditing(false)}
        >
          <SelectTrigger className="h-8 w-28 text-xs focus:ring-ring" autoFocus>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              [
                'in_process',
                'in_preparation',
                'shipped',
                'sold_in_person',
                'completed',
                'canceled',
              ] as SaleStatus[]
            ).map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {isClient ? t(status) : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex justify-center" onDoubleClick={handleDoubleClick}>
      <Badge
        variant={statusVariantMap[currentStatus]}
        className={cn('flex w-28 justify-center capitalize', {
          'cursor-pointer hover:opacity-80': !isFinalState,
        })}
        title={!isFinalState && isClient ? 'Double-click to edit' : ''}
      >
        {isClient ? t(currentStatus) : currentStatus}
      </Badge>
    </div>
  );
}
