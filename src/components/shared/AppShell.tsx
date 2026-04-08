import TabNav from "@/components/shared/TabNav";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <TabNav />
      <div className={styles.content}>
        <div className={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}
