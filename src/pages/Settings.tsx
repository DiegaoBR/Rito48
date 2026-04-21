import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const qc = useQueryClient();
  const [chatId, setChatId] = useState("");
  const [autoSend, setAutoSend] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setChatId(settings.telegram_chat_id ?? "");
      setAutoSend(settings.auto_send);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("settings")
        .update({ telegram_chat_id: chatId || null, auto_send: autoSend, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Configurações salvas! ✅" });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6 max-w-lg">
        <h2 className="text-2xl font-bold">Configurações</h2>

        <Card>
          <CardHeader>
            <CardTitle>Telegram</CardTitle>
            <CardDescription>Configure o bot e o canal de destino para as ofertas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chatId">Chat ID do canal/grupo</Label>
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Ex: -1001234567890"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use @userinfobot no Telegram para descobrir o ID do seu canal.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Envio automático</Label>
                <p className="text-xs text-muted-foreground">Enviar ofertas ao Telegram automaticamente ao importar/cadastrar</p>
              </div>
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
            </div>

            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
