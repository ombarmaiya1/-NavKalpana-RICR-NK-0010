import styles from './Card.module.css';

/**
 * Card — Reusable ACIE card container
 *
 * @param {'default'|'elevated'|'bordered'|'glass'} variant
 * @param {boolean}         hoverable   — adds lift-on-hover
 * @param {boolean}         padded      — applies default padding (default: true)
 * @param {string}          className
 * @param {React.ReactNode} header      — optional header slot
 * @param {React.ReactNode} footer      — optional footer slot
 */
export default function Card({
    children,
    variant = 'default',
    hoverable = false,
    padded = true,
    className = '',
    header,
    footer,
    style,
    ...rest
}) {
    const classes = [
        styles.card,
        styles[`card--${variant}`],
        hoverable ? styles['card--hoverable'] : '',
        padded ? styles['card--padded'] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} style={style} {...rest}>
            {header && (
                <div className={styles.cardHeader}>{header}</div>
            )}

            <div className={styles.cardBody}>{children}</div>

            {footer && (
                <div className={styles.cardFooter}>{footer}</div>
            )}
        </div>
    );
}
