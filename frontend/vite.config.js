import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mock API Plugin to serve learning data required by the frontend
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Mock /api/learning/topics
      if (req.url === '/api/learning/topics') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          {
            id: "1",
            title: "Data Structures & Algorithms",
            description: "Master core DSA concepts",
            progress: 60,
            totalModules: 20,
            completedModules: 12
          },
          {
            id: "2",
            title: "Frontend Development",
            description: "React, UI/UX, Performance",
            progress: 40,
            totalModules: 15,
            completedModules: 6
          }
        ]));
        return;
      }

      // Mock /api/learning/topic/:id
      const topicMatch = req.url.match(/^\/api\/learning\/topic\/([^/?]+)/);
      if (topicMatch) {
        const topicId = topicMatch[1];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: topicId,
          title: topicId === "1" ? "Data Structures & Algorithms" : "Frontend Development",
          modules: [
            { id: "m1", title: "Arrays", completed: true },
            { id: "m2", title: "Linked List", completed: false }
          ]
        }));
        return;
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mockApiPlugin()],
})
