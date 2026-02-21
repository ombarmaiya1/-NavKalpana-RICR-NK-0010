import styles from './Button.module.css';

/**
 * Button — Reusable ACIE button component
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'}  size
 * @param {boolean}         fullWidth
 * @param {boolean}         loading
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {string}          className  — extra class names
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    fullWidth  ? styles['btn--full']    : '',
    loading    ? styles['btn--loading'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true" />
      )}

      {!loading && leftIcon && (
        <span className={styles.iconLeft}>{leftIcon}</span>
      )}

      <span className={styles.label}>{children}</span>

      {!loading && rightIcon && (
        <span className={styles.iconRight}>{rightIcon}</span>
      )}
    </button>
  );
}
