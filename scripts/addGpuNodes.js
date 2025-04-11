// scripts/addGpuNodes.js

export function simulateGpuNodes(count = 5) {
    const nodes = [];
    for (let i = 0; i < count; i++) {
      const id = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const node = {
        id,
        gpuUsage: Math.floor(Math.random() * 100),
        latency: Math.floor(Math.random() * 50) + 5,
        bandwidth: (Math.random() * 2).toFixed(2) + 'Gbps',
        status: 'connected',
      };
      nodes.push(node);
      console.log(`[GPU Mesh] Novo nó adicionado: ${id}`);
      window.dispatchEvent(new CustomEvent("gpu-mesh:new-node", { detail: node }));
    }
    return nodes;
  }
  