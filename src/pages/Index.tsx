import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Send, AlertCircle, TrendingUp } from "lucide-react";

export default function Index() {
  const { data: offers } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const total = offers?.length ?? 0;
  const active = offers?.filter((o) => o.status === "active").length ?? 0;
  const sent = offers?.filter((o) => o.status === "sent").length ?? 0;
  const expired = offers?.filter((o) => o.status === "expired").length ?? 0;

  const stats = [
    { label: "Total de Ofertas", value: total, icon: Package, color: "text-primary" },
    { label: "Ativas", value: active, icon: TrendingUp, color: "text-[hsl(var(--success))]" },
    { label: "Enviadas", value: sent, icon: Send, color: "text-muted-foreground" },
    { label: "Expiradas", value: expired, icon: AlertCircle, color: "text-destructive" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
