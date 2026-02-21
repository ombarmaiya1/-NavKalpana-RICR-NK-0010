import '../styles/theme.css';

/**
 * Card — glassmorphism card component.
 *
 * Props:
 *   children  — card content
 *   className — extra classes (optional)
 *   style     — inline style overrides (optional)
 *   ...rest   — any other div props (e.g. onClick, id)
 */
export default function Card({ children, className = '', style, ...rest }) {
    return (
        <div
            className={`glass-card ${className}`.trim()}
            style={style}
            {...rest}
        >
            {children}
        </div>
    );
}
