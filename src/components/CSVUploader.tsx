import { useCallback, useState } from "react";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, Check } from "lucide-react";
import type { TablesInsert } from "@/integrations/supabase/types";

type OfferInsert = TablesInsert<"offers">;

interface CSVRow {
  titulo: string;
  preco_original: string;
  preco_promocional: string;
  link_afiliado: string;
  categoria?: string;
}

interface ParsedRow {
  data: OfferInsert;
  errors: string[];
  row: number;
}

interface CSVUploaderProps {
  onImport: (offers: OfferInsert[]) => void;
  isLoading?: boolean;
}

function validateRow(raw: CSVRow, index: number): ParsedRow {
  const errors: string[] = [];
  const title = raw.titulo?.trim();
  const origStr = raw.preco_original?.toString().replace(",", ".");
  const promoStr = raw.preco_promocional?.toString().replace(",", ".");
  const link = raw.link_afiliado?.trim();

  if (!title) errors.push("Título vazio");
  const original_price = parseFloat(origStr);
  if (isNaN(original_price) || original_price <= 0) errors.push("Preço original inválido");
  const promo_price = parseFloat(promoStr);
  if (isNaN(promo_price) || promo_price <= 0) errors.push("Preço promocional inválido");
  if (!link) errors.push("Link de afiliado vazio");

  return {
    data: {
      title: title || "",
      original_price: isNaN(original_price) ? 0 : original_price,
      promo_price: isNaN(promo_price) ? 0 : promo_price,
      affiliate_link: link || "",
      category: raw.categoria?.trim() || null,
    },
    errors,
    row: index + 1,
  };
}

export function CSVUploader({ onImport, isLoading }: CSVUploaderProps) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data.map((row, i) => validateRow(row, i));
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
              Colunas: titulo, preco_original, preco_promocional, link_afiliado, categoria
            </p>
            {fileName && <p className="text-sm text-primary mt-2">📄 {fileName}</p>}
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
                    <TableHead>Original</TableHead>
                    <TableHead>Promo</TableHead>
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
                      <TableCell>R$ {row.data.original_price.toFixed(2)}</TableCell>
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
