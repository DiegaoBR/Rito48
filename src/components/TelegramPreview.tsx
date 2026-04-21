import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Tables } from "@/integrations/supabase/types";

type Offer = Tables<"offers">;

export function formatTelegramMessage(offer: Offer): string {
  const discount = Math.round(((offer.original_price - offer.promo_price) / offer.original_price) * 100);
  return `🔥 *${offer.title}*

💰 ~R$ ${offer.original_price.toFixed(2)}~ → *R$ ${offer.promo_price.toFixed(2)}*
📉 Desconto: *${discount}%*
${offer.category ? `📦 Categoria: ${offer.category}\n` : ""}
🛒 [COMPRAR AGORA](${offer.affiliate_link})`;
}

export function TelegramPreview({ offer }: { offer: Offer }) {
  const msg = formatTelegramMessage(offer);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Preview Telegram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
          {msg}
        </div>
      </CardContent>
    </Card>
  );
}
