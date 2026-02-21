import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Card from './components/Card';
import './index.css';

/**
 * App — root component.
 * Wrap all page content with <ThemeProvider> so every child
 * can access useTheme().  Navbar is placed at the top-level
 * layout; individual page routes go below the Navbar.
 */
function App() {
  return (
    <ThemeProvider>
      <Navbar />

      {/* ── Demo content — replace with your Router / Pages ── */}
      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
          NavKalpana
        </h1>
        <p style={{ marginBottom: '2rem' }}>
          Design system ready — dark/light mode with glassmorphism.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <Card>
            <h3 style={{ marginBottom: '0.5rem' }}>Glass Card</h3>
            <p>backdrop-filter blur · CSS variable colours · soft shadow</p>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '0.5rem' }}>Theme Toggle</h3>
            <p>Click the ☀ / 🌙 button in the navbar to switch modes. Preference is saved to localStorage.</p>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '0.75rem' }}>Primary Button</h3>
            <button className="btn-primary">Glow on hover</button>
          </Card>
        </div>
      </main>
    </ThemeProvider>
  );
}

export default App;
