document.addEventListener("DOMContentLoaded", () => {
  // Análise On-Chain
  document.querySelector("#btnOnChain")?.addEventListener("click", () => {
    showModal("Análise On-Chain", `
      <canvas id="onChainChart" width="400" height="200"></canvas>
      <p>Essa visualização mostra a distribuição de movimentações dos principais tokens na rede Bitcoin, simulando dados on-chain de forma visual.</p>
    `);
    renderChart("onChainChart");
  });

  // Comparação de Tokens
  document.querySelector("#btnCompareTokens")?.addEventListener("click", () => {
    showModal("Comparação de Tokens", `
      <div class="compare-container">
        <div class="token-card"><h3>ORDI</h3><p>Preço: $38.47</p><p>Detentores: 42,862</p></div>
        <div class="vs">VS</div>
        <div class="token-card"><h3>SATOSHI</h3><p>Preço: $0.00001234</p><p>Detentores: 11,254</p></div>
      </div>
    `);
  });

  // Alertas Personalizados
  document.querySelector("#btnAlerts")?.addEventListener("click", () => {
    showModal("Alertas Personalizados", `
      <input type="text" placeholder="Ex: Alerta para ORDI subir 10%" class="input-alert"/>
      <button onclick="alertCreated()">Criar Alerta</button>
    `);
  });

  // API & Documentação
  document.querySelector("#btnAPI")?.addEventListener("click", () => {
    showModal("API & Documentação", `
      <pre><code>GET /api/runes/token/ordi</code></pre>
      <pre>{
  "token": "ORDI",
  "price": "38.47",
  "holders": 42862
}</pre>
      <button onclick="copyExample()">Copiar exemplo</button>
    `);
  });
});

function showModal(title, content) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      ${content}
      <button onclick="this.closest('.modal').remove()">Fechar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderChart(id) {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["ORDI", "SATOSHI", "CYPHER"],
      datasets: [{
        label: "Movimentações por hora",
        data: [12, 19, 7],
        backgroundColor: ["#00FF41", "#FF5722", "#2196F3"]
      }]
    },
    options: { responsive: true }
  });
}

function alertCreated() {
  alert("✅ Alerta criado com sucesso!");
}

function copyExample() {
  navigator.clipboard.writeText("GET /api/runes/token/ordi").then(() => {
    alert("Exemplo copiado para a área de transferência.");
  });
} 