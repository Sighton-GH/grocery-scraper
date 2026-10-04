import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function groceryApiPlugin(): Plugin {
  return {
    name: 'grocery-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/download-master-excel', (_req, res) => {
        const filePath = path.resolve(__dirname, 'canadian_grocery_prices_master.xlsx');
        if (fs.existsSync(filePath)) {
          const file = fs.readFileSync(filePath);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename="Canadian_Grocery_Prices_All_Chains.xlsx"');
          res.end(file);
        } else {
          res.statusCode = 404;
          res.end('File not found');
        }
      });

      server.middlewares.use('/api/download-master-csv', (_req, res) => {
        const filePath = path.resolve(__dirname, 'canadian_grocery_prices_master.csv');
        if (fs.existsSync(filePath)) {
          const file = fs.readFileSync(filePath);
          res.setHeader('Content-Type', 'text/csv; charset=utf-8');
          res.setHeader('Content-Disposition', 'attachment; filename="Canadian_Grocery_Prices_All_Chains.csv"');
          res.end(file);
        } else {
          res.statusCode = 404;
          res.end('File not found');
        }
      });

      server.middlewares.use('/api/scrape-flipp', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost:3000');
          const q = urlObj.searchParams.get('q') || 'butter';
          const postal = urlObj.searchParams.get('postal_code') || 'V5K0A1';

          const targetUrl = `https://backflipp.wishabi.com/flipp/items/search?q=${encodeURIComponent(q)}&postal_code=${encodeURIComponent(postal)}`;
          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ error: `Flipp API returned ${response.status}` }));
            return;
          }

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Scrape proxy failure' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), groceryApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
