import Link from "next/link";
import styles from "./page.module.css";

export default async function Home() {
  return (
    <div >
      <h2 className={styles.subtitle}>日程調整サイト</h2>
      <h1 className={styles.title}>tapla</h1>
      <Link href="/create">
        <button className={styles.eventCreateButton}>
          イベントを作成
        </button>
      </Link>
    
    </div>
  );
}
