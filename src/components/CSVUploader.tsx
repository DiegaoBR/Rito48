import { useCallback, useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, Check } from "lucide-react";
import type { TablesInsert } from "@/integrations/supabase/types";

type OfferInsert = TablesInsert<"offers">;

interface ParsedRow {
  data: OfferInsert;
  errors: string[];
  row: number;
}

interface CSVUploaderProps {
  onImport: (offers: OfferInsert[]) => void;
  isLoading?: boolean;
}

function parsePrice(value: string | undefined): number {
  if (!value) return NaN;
  // Remove "R$", spaces, dots (thousands), then swap comma for dot
  const cleaned = value.toString().replace(/R\$\s*/g, "").replace(/\./g, "").replace(",", ".").trim();
  return parseFloat(cleaned);
}

function isShopeeFormat(headers: string[]): boolean {
  const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\ufeff/g, ""));
  return normalized.includes("item name") && normalized.includes("offer link");
}

function normalizeRow(raw: Record<string, string>, shopee: boolean): { title: string; original_price: number; promo_price: number; affiliate_link: string; category: string | null } {
  if (shopee) {
    const price = parsePrice(raw["Price"]);
    // Shopee export has no original price, use same as promo
    return {
      title: (raw["Item Name"] ?? "").trim(),
      original_price: price,
      promo_price: price,
      affiliate_link: (raw["Offer Link"] ?? "").trim(),
      category: (raw["Shop Name"] ?? "").trim() || null,
    };
  }
  return {
    title: (raw["titulo"] ?? "").trim(),
    original_price: parsePrice(raw["preco_original"]),
    promo_price: parsePrice(raw["preco_promocional"]),
    affiliate_link: (raw["link_afiliado"] ?? "").trim(),
    category: (raw["categoria"] ?? "").trim() || null,
  };
}

function validateRow(raw: Record<string, string>, index: number, shopee: boolean): ParsedRow {
  const errors: string[] = [];
  const norm = normalizeRow(raw, shopee);

  if (!norm.title) errors.push("Título vazio");
  if (isNaN(norm.original_price) || norm.original_price <= 0) errors.push("Preço inválido");
  if (isNaN(norm.promo_price) || norm.promo_price <= 0) errors.push("Preço promo inválido");
  if (!norm.affiliate_link) errors.push("Link vazio");

  return {
    data: {
      title: norm.title || "",
      original_price: isNaN(norm.original_price) ? 0 : norm.original_price,
      promo_price: isNaN(norm.promo_price) ? 0 : norm.promo_price,
      affiliate_link: norm.affiliate_link || "",
      category: norm.category,
    },
    errors,
    row: index + 1,
  };
}

export function CSVUploader({ onImport, isLoading }: CSVUploaderProps) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [detectedFormat, setDetectedFormat] = useState<string>("");

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        const shopee = isShopeeFormat(headers);
        setDetectedFormat(shopee ? "Shopee Export" : "Padrão");
        const rows = results.data.map((row, i) => validateRow(row, i, shopee));
        setParsed(rows);
      },
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const validRows = parsed.filter((r) => r.errors.length === 0);
  const errorRows = parsed.filter((r) => r.errors.length > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/60 transition-colors cursor-pointer"
            onClick={() => document.getElementById("csv-input")?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-primary/60 mb-3" />
            <p className="font-medium">Arraste o arquivo CSV ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground mt-1">
              Suporta: Export Shopee ou CSV padrão (titulo, preco_original, preco_promocional, link_afiliado, categoria)
            </p>
            {fileName && (
              <p className="text-sm text-primary mt-2">
                📄 {fileName} {detectedFormat && <Badge variant="secondary" className="ml-2">{detectedFormat}</Badge>}
              </p>
            )}
            <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={onFileInput} />
          </div>
        </CardContent>
      </Card>

      {parsed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Preview ({validRows.length} válidas, {errorRows.length} com erro)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((row, i) => (
                    <TableRow key={i} className={row.errors.length > 0 ? "bg-destructive/5" : ""}>
                      <TableCell className="font-mono text-xs">{row.row}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{row.data.title}</TableCell>
                      <TableCell>R$ {row.data.promo_price.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs">{row.data.affiliate_link}</TableCell>
                      <TableCell>{row.data.category || "-"}</TableCell>
                      <TableCell>
                        {row.errors.length > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {row.errors[0]}
                          </Badge>
                        ) : (
                          <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] text-xs">
                            <Check className="h-3 w-3 mr-1" /> OK
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button
                onClick={() => onImport(validRows.map((r) => r.data))}
                disabled={validRows.length === 0 || isLoading}
              >
                {isLoading ? "Importando..." : `Importar ${validRows.length} ofertas`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
