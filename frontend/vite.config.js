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

      // Mock /api/assignments
      if (req.url === '/api/assignments') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify([
          {
            id: "a1",
            title: "Implement Linked List",
            topic: "Data Structures",
            dueDate: "2026-03-10",
            status: "pending",
            marks: null
          },
          {
            id: "a2",
            title: "Build Responsive Landing Page",
            topic: "Frontend Development",
            dueDate: "2026-03-15",
            status: "graded",
            marks: 85
          }
        ]));
        return;
      }

      // Mock POST /api/assignments/:id/submit
      const assignmentSubmitMatch = req.url.match(/^\/api\/assignments\/([^/?]+)\/submit/);
      if (req.method === 'POST' && assignmentSubmitMatch) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: "Assignment submitted successfully" }));
        return;
      }

      // Mock GET /api/assignments/:id
      const assignmentMatch = req.url.match(/^\/api\/assignments\/([^/?]+)/);
      if (req.method === 'GET' && assignmentMatch) {
        const id = assignmentMatch[1];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          id: id,
          title: id === "a1" ? "Implement Linked List" : "Build Responsive Landing Page",
          topic: id === "a1" ? "Data Structures" : "Frontend Development",
          description: id === "a1" ? "Create a singly linked list with insert, delete and search operations." : "Create a fully responsive landing page using plain CSS or Tailwind.",
          instructions: "Submit GitHub repo link.",
          dueDate: id === "a1" ? "2026-03-10" : "2026-03-15",
          status: id === "a1" ? "pending" : "graded",
          submission: id === "a2" ? "https://github.com/student/landing-page" : null,
          marks: id === "a2" ? 85 : null
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
