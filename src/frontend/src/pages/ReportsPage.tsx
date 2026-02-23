import { useState } from 'react';
import { useGetAllTransactions, useGetAllOrders } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { OrderStatus } from '../backend';

const formatCurrency = (amount: number | bigint): string => {
  const value = Number(amount) / 100;
  return `€${value.toFixed(2)}`;
};

export default function ReportsPage() {
  const { data: transactions = [], isLoading: transactionsLoading } = useGetAllTransactions();
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const isLoading = transactionsLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;
  const oneMonthMs = 30 * oneDayMs;

  const filterByPeriod = (timestamp: bigint) => {
    const timestampMs = Number(timestamp) / 1_000_000;
    const diff = now - timestampMs;

    if (period === 'daily') return diff <= oneDayMs;
    if (period === 'weekly') return diff <= oneWeekMs;
    if (period === 'monthly') return diff <= oneMonthMs;
    return false;
  };

  const filteredTransactions = transactions.filter((t) => filterByPeriod(t.timestamp));
  const filteredOrders = orders.filter((o) => filterByPeriod(o.timestamp));

  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const completedOrders = filteredOrders.filter((o) => o.status === OrderStatus.completed).length;
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  const paymentMethodBreakdown = filteredTransactions.reduce((acc, t) => {
    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const periodLabels = {
    daily: 'Ditore',
    weekly: 'Javore',
    monthly: 'Mujore',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Raportet Financiare</h2>
          <p className="text-sm text-muted-foreground mt-1">Analizë e shitjeve dhe të ardhurave</p>
        </div>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Ditore</SelectItem>
            <SelectItem value="weekly">Javore</SelectItem>
            <SelectItem value="monthly">Mujore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Të Ardhura Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Periudha: {periodLabels[period]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porosi të Përfunduara</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">Periudha: {periodLabels[period]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vlera Mesatare e Porosisë</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Math.round(averageOrderValue))}</div>
            <p className="text-xs text-muted-foreground">Periudha: {periodLabels[period]}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transaksionet</TabsTrigger>
          <TabsTrigger value="payment-methods">Metodat e Pagesës</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaksionet e Fundit</CardTitle>
              <CardDescription>Lista e transaksioneve për periudhën e zgjedhur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nuk ka transaksione për këtë periudhë</p>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id.toString()}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">Transaksioni #{transaction.id.toString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.paymentMethod}
                          {transaction.orderId && ` • Porosia #${transaction.orderId.toString()}`}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shpërndarja sipas Metodës së Pagesës</CardTitle>
              <CardDescription>Të ardhurat e ndara sipas metodës së pagesës</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentMethodBreakdown).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nuk ka të dhëna për këtë periudhë</p>
                ) : (
                  Object.entries(paymentMethodBreakdown).map(([method, amount]) => (
                    <div key={method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{method}</span>
                        <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(amount / totalRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {((amount / totalRevenue) * 100).toFixed(1)}% e totalit
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
