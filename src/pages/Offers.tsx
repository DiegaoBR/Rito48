import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { OfferCard } from "@/components/OfferCard";
import { OfferForm } from "@/components/OfferForm";
import { TelegramPreview } from "@/components/TelegramPreview";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Offer = Tables<"offers">;

export default function Offers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);

  const { data: offers = [] } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (offer: TablesInsert<"offers">) => {
      const { error } = await supabase.from("offers").insert(offer);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast({ title: "Oferta adicionada!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast({ title: "Oferta removida" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const { data: settings } = await supabase.from("settings").select("telegram_chat_id").eq("id", 1).single();
      if (!settings?.telegram_chat_id) throw new Error("Configure o Chat ID do Telegram nas configurações.");

      const { error } = await supabase.functions.invoke("send-telegram", {
        body: { offer, chatId: settings.telegram_chat_id },
      });
      if (error) throw error;

      await supabase.from("offers").update({ status: "sent" }).eq("id", offer.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast({ title: "Oferta enviada para o Telegram! ✅" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" });
    },
  });

  const filtered = offers.filter((o) =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    (o.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = (status: string) => filtered.filter((o) => o.status === status);

  return (
    <AppLayout>
      <div className="space-y-6">
        <OfferForm onSubmit={(o) => addMutation.mutate(o)} isLoading={addMutation.isPending} />

        <Input placeholder="Buscar ofertas..." value={search} onChange={(e) => setSearch(e.target.value)} />

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Ativas ({byStatus("active").length})</TabsTrigger>
            <TabsTrigger value="sent">Enviadas ({byStatus("sent").length})</TabsTrigger>
            <TabsTrigger value="expired">Expiradas ({byStatus("expired").length})</TabsTrigger>
          </TabsList>
          {["active", "sent", "expired"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byStatus(status).map((offer) => (
                  <div key={offer.id} onClick={() => setPreviewOffer(offer)} className="cursor-pointer">
                    <OfferCard
                      offer={offer}
                      onSend={(o) => { sendMutation.mutate(o); }}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  </div>
                ))}
                {byStatus(status).length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma oferta {status === "active" ? "ativa" : status === "sent" ? "enviada" : "expirada"}.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {previewOffer && <TelegramPreview offer={previewOffer} />}
      </div>
    </AppLayout>
  );
}
