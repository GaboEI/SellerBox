'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Sale } from '@/lib/types';
import { useMemo } from 'react';

interface SalesChartProps {
  sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  const data = useMemo(() => {
    const monthlySales = sales
      .filter((s) => s.status === 'completed' || s.status === 'sold_in_person')
      .reduce((acc, sale) => {
        const month = new Date(sale.date).toLocaleString('default', {
          month: 'short',
        });
        acc[month] = (acc[month] || 0) + (sale.saleAmount || 0);
        return acc;
      }, {} as { [key: string]: number });

    const monthOrder = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    
    return monthOrder.map(month => ({
        name: month,
        total: monthlySales[month] || 0,
    })).filter(d => d.total > 0);
    
  }, [sales]);

  const chartConfig = {
    total: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString('ru-RU')} ₽`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`}/>}
              />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
