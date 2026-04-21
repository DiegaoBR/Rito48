import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Offer = Tables<"offers">;

interface OfferCardProps {
  offer: Offer;
  onSend: (offer: Offer) => void;
  onDelete: (id: string) => void;
}

function calcDiscount(original: number, promo: number) {
  return Math.round(((original - promo) / original) * 100);
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "Ativa", variant: "default" },
  sent: { label: "Enviada", variant: "secondary" },
  expired: { label: "Expirada", variant: "destructive" },
};

export function OfferCard({ offer, onSend, onDelete }: OfferCardProps) {
  const discount = calcDiscount(offer.original_price, offer.promo_price);
  const st = statusMap[offer.status] ?? statusMap.active;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{offer.title}</p>
            {offer.category && (
              <span className="text-xs text-muted-foreground">{offer.category}</span>
            )}
          </div>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            R$ {offer.promo_price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            R$ {offer.original_price.toFixed(2)}
          </span>
          {discount > 0 && (
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button size="sm" className="flex-1" onClick={() => onSend(offer)} disabled={offer.status === "sent"}>
            <Send className="h-3 w-3 mr-1" /> Enviar
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(offer.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
