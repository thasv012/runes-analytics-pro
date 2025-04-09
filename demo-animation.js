// demo-animation.js
window.RunesDemo = {
  init: function (containerElement) { // Receive container element as argument
    console.log("🏁 RunesDemo initialized!");

    // Use the passed container element or query by ID as fallback
    const el = containerElement || document.querySelector("#runes-demo-container"); // Use the correct ID

    if (el) {
      // Clear previous content if any, before adding new content
      el.innerHTML = "<h3 style='color:#00ff41; text-align: center; margin-top: 2rem;'>[✔] Demo Gamificada Ativada!</h3>";
      // Example: Add more complex placeholder content
      el.innerHTML += `<div style="padding: 20px; border: 1px dashed #8A2BE2; margin-top: 20px; border-radius: 5px;">
                         <p style="color: #ccc;">Simulating gamified dashboard...</p>
                         <p style="color: #00BFFF;">XP: 150 | Level: 2 | Next Achievement: Whale Spotter</p>
                         <canvas id="demo-chart-placeholder" height="100"></canvas>
                       </div>`;
       // Optional: Render a simple chart placeholder if Chart.js is available
       if (typeof Chart !== 'undefined') {
           const canvas = el.querySelector('#demo-chart-placeholder');
           if(canvas) {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: { labels: ['', '', '', ''], datasets: [{ data: [10, 40, 20, 50], borderColor: '#8A2BE2', tension: 0.4, pointRadius: 0 }]},
                    options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
                });
           }
       }

    } else {
        console.error('[RunesDemo] Target container (#runes-demo-container) not found in DOM.');
    }

    // Aqui você pode adicionar animações reais, XP, cards etc
  },

  // Optional: Add a destroy function to clean up if needed when ESC is pressed
  destroy: function() {
      console.log("🧹 RunesDemo destroyed (Placeholder - implement cleanup if needed).");
      // Example: remove listeners, clear intervals, etc.
  }
}; 