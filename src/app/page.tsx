import Link from "next/link";
import styles from "./page.module.css";
import BackgroundPattern from "@/component/BackGroundPattern";

export default async function Home() {
  return (
    <>
      <BackgroundPattern />
      <div className={styles.heroTitle}>
        <h1 className={styles.title}>tapla</h1>
        <p>タップしてみんなの予定を教えろください</p>
        <Link href="/create">
          <button className={styles.eventCreateButton}>
            try
          </button>
        </Link>
      </div>

      <h2>使い方</h2>
      <p>3ステップで簡単に予定調整</p>

      <ol>
        <li>予定を作成</li>
        <li>タップで参加</li>
        <li>結果を確認</li>
      </ol>

      <h2>主な特徴</h2>

      <ol>
        <li>認証機能</li>
        <li>自動入力</li>
        <li>モバイル対応</li>
      </ol>

      <h2>今すぐサークルの予定調整を楽にしましょう！</h2>
      <p>面倒な予定調整はもう終わり。taplaで、みんなが笑顔になる時間を作りましょう。</p>

      <Link href="/create">
        <button className={styles.eventCreateButton}>
          無料で始める
        </button>
      </Link>

      
    </>
  );
}
