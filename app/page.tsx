import { AuthLanding } from "@/components/auth/AuthLanding";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <AuthLanding />
    </div>
  );
}
