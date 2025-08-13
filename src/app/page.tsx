import Link from "next/link";
import styles from "./page.module.css";
import BackgroundPattern from "@/component/BackGroundPattern";
import  HowToUse from "@/app/_component/HowToUse";

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

      <HowToUse />

      
      <section id="features" className="text-center">
        <h2 className="text-3xl bg-gradient-to-r to-green-200  from-blue-300 inline-block text-transparent bg-clip-text">主な特徴</h2>


        <ol>
          <li>認証機能</li>
          <li>自動入力</li>
          <li>モバイル対応</li>
        </ol>
      </section>

      <section id="cta" className="text-center">
      <h2 className="text-3xl bg-gradient-to-r from-red-300 via-50% to-green-200 via-blue-200 inline-block text-transparent bg-clip-text">今すぐサークルの予定調整を<br />楽にしましょう！</h2>
      <p className="">面倒な予定調整はもう終わり。<br />taplaで、みんなが笑顔になる時間を作りましょう。</p>
      </section>

      <Link href="/create">
        <button className={styles.eventCreateButton}>
          無料で始める
        </button>
      </Link>

      
    </>
  );
}
