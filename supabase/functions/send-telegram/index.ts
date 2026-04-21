import { corsHeaders } from '@supabase/supabase-js/cors';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const BodySchema = z.object({
  offer: z.object({
    title: z.string(),
    original_price: z.number(),
    promo_price: z.number(),
    affiliate_link: z.string(),
    category: z.string().nullable().optional(),
  }),
  chatId: z.string().min(1),
});

function formatMessage(offer: z.infer<typeof BodySchema>['offer']): string {
  const discount = Math.round(((offer.original_price - offer.promo_price) / offer.original_price) * 100);
  let msg = `🔥 *${offer.title}*\n\n`;
  msg += `💰 ~R$ ${offer.original_price.toFixed(2)}~ → *R$ ${offer.promo_price.toFixed(2)}*\n`;
  msg += `📉 Desconto: *${discount}%*\n`;
  if (offer.category) msg += `📦 Categoria: ${offer.category}\n`;
  msg += `\n🛒 [COMPRAR AGORA](${offer.affiliate_link})`;
  return msg;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { offer, chatId } = parsed.data;
    const text = formatMessage(offer);

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Telegram API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, message_id: data.result?.message_id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending Telegram message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
