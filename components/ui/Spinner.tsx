import styles from "./Spinner.module.css";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-busy="true">
      <span className={styles.ring} aria-hidden />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
