import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TablesInsert } from "@/integrations/supabase/types";

interface OfferFormProps {
  onSubmit: (offer: TablesInsert<"offers">) => void;
  isLoading?: boolean;
}

export function OfferForm({ onSubmit, isLoading }: OfferFormProps) {
  const [title, setTitle] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      original_price: parseFloat(originalPrice),
      promo_price: parseFloat(promoPrice),
      affiliate_link: affiliateLink,
      category: category || null,
    });
    setTitle("");
    setOriginalPrice("");
    setPromoPrice("");
    setAffiliateLink("");
    setCategory("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cadastrar Oferta</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="orig">Preço Original (R$)</Label>
            <Input id="orig" type="number" step="0.01" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="promo">Preço Promocional (R$)</Label>
            <Input id="promo" type="number" step="0.01" min="0" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="link">Link de Afiliado</Label>
            <Input id="link" type="url" value={affiliateLink} onChange={(e) => setAffiliateLink(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="cat">Categoria</Label>
            <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Eletrônicos" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Adicionar Oferta"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
