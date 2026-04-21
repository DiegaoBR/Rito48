

## Painel de Ofertas Shopee + Envio Automático para Telegram

### Visão Geral
Um painel web onde você gerencia ofertas de afiliado Shopee, com envio automático para grupos/canais do Telegram. O sistema permite importação em massa via arquivo CSV.

---

### Funcionalidades

#### 1. Painel de Ofertas
- Cadastro manual de ofertas com: título, preço original, preço promocional, link de afiliado, imagem, categoria e validade
- **Importação via CSV**: upload de planilha CSV com colunas (título, preço original, preço promocional, link de afiliado, categoria). O sistema lê o arquivo, exibe preview dos dados e importa todas as ofertas de uma vez
- Lista de ofertas com status (ativa, expirada, enviada)
- Filtros por categoria e status

#### 2. Envio para Telegram
- Conexão com bot do Telegram via conector Lovable
- Configuração do chat/canal de destino
- Botão "Enviar agora" para cada oferta
- Envio automático: ao cadastrar/importar ofertas, elas são enviadas automaticamente para o canal
- Mensagem formatada com emoji, preço, desconto e link de afiliado

#### 3. Agendamento
- Opção de agendar envios para horários de pico (ex: 12h, 19h)
- Fila de ofertas programadas com preview da mensagem

#### 4. Dashboard simples
- Total de ofertas enviadas
- Ofertas ativas vs expiradas

---

### Formato CSV esperado

```text
titulo,preco_original,preco_promocional,link_afiliado,categoria
"Fone Bluetooth XYZ",89.90,39.90,"https://shope.ee/abc123","Eletrônicos"
"Camiseta Dry Fit",49.90,19.90,"https://shope.ee/def456","Moda"
```

O sistema fará validação das colunas, mostrará erros linha a linha e permitirá corrigir antes de confirmar a importação.

---

### Design
- Interface limpa e funcional, cores laranja (Shopee) como destaque
- Mobile-friendly para gerenciar pelo celular
- Cards de oferta com visual de promoção (badge de desconto, preço riscado)
- Área de upload com drag-and-drop para o CSV

---

### Stack Técnica
- **Frontend**: React + Tailwind (painel web) com Papa Parse para leitura de CSV
- **Backend**: Supabase (banco de dados + edge functions)
- **Telegram**: Conector Lovable (envio de mensagens via gateway)
- **Agendamento**: pg_cron para envios programados

### Arquivos principais a criar
- `src/pages/Index.tsx` — Dashboard principal
- `src/pages/Offers.tsx` — Lista e gerenciamento de ofertas
- `src/pages/ImportCSV.tsx` — Tela de importação CSV com preview
- `src/pages/Settings.tsx` — Configuração do bot Telegram e canal
- `src/components/OfferCard.tsx` — Card visual de oferta
- `src/components/CSVUploader.tsx` — Componente de upload e parse do CSV
- `src/components/OfferForm.tsx` — Formulário manual de cadastro
- `src/components/TelegramPreview.tsx` — Preview da mensagem formatada
- Tabelas Supabase: `offers`, `scheduled_sends`, `settings`
- Edge Function: `send-telegram` para disparo de mensagens

