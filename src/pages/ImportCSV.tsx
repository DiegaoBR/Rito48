import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { CSVUploader } from "@/components/CSVUploader";
import { toast } from "@/hooks/use-toast";
import type { TablesInsert } from "@/integrations/supabase/types";

export default function ImportCSV() {
  const qc = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (offers: TablesInsert<"offers">[]) => {
      const { error } = await supabase.from("offers").insert(offers);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["offers"] });
      toast({ title: `${vars.length} ofertas importadas com sucesso! 🎉` });
    },
    onError: (err: Error) => {
      toast({ title: "Erro na importação", description: err.message, variant: "destructive" });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Importar Ofertas via CSV</h2>
        <p className="text-muted-foreground">
          Suba um arquivo CSV com as colunas: <code className="bg-muted px-1 rounded text-sm">titulo</code>,{" "}
          <code className="bg-muted px-1 rounded text-sm">preco_original</code>,{" "}
          <code className="bg-muted px-1 rounded text-sm">preco_promocional</code>,{" "}
          <code className="bg-muted px-1 rounded text-sm">link_afiliado</code>,{" "}
          <code className="bg-muted px-1 rounded text-sm">categoria</code> (opcional).
        </p>
        <CSVUploader onImport={(offers) => importMutation.mutate(offers)} isLoading={importMutation.isPending} />
      </div>
    </AppLayout>
  );
}
