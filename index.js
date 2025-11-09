const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Função para buscar últimos 10 valores do dólar
async function getDollarRates() {
  const hoje = new Date();
  const inicio = new Date();
  inicio.setDate(hoje.getDate() - 15); // pega últimos 15 dias (garante 10 úteis)

  const formato = (d) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;

  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial=${formato(
    inicio
  )}&dataFinal=${formato(hoje)}`;

  const { data } = await axios.get(url);
  const ultimos10 = data.slice(-10);
  return ultimos10
    .map((d) => `📅 ${d.data} — R$ ${d.valor}`)
    .join("\n");
}

// Endpoint para receber mensagens do Teams
app.post("/api/messages", async (req, res) => {
  const text = req.body?.text || "";

  if (text.toLowerCase().includes("ultimos10")) {
    try {
      const cotacoes = await getDollarRates();
      return res.json({
        type: "message",
        text: `💵 **Últimos 10 valores do dólar comercial:**\n${cotacoes}`,
      });
    } catch (err) {
      console.error(err);
      return res.json({
        type: "message",
        text: "❌ Erro ao buscar os dados do Banco Central.",
      });
    }
  }

  return res.json({
    type: "message",
    text: "👋 Use o comando `@dolarbot ultimos10` para ver as últimas cotações.",
  });
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
