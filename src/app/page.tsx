import Link from "next/link";
import styles from "./page.module.css";
import BackgroundPattern from "@/BackGroundPattern";
import  HowToUse from "@/app/_component/HowToUse";
import Feature from "./_component/Feature";

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

      <Feature />

      <section id="cta" className="py-20 text-center mt-20 bg-gradient-to-r from-[var(--pastel-pink)]/10 via-[var(--pastel-blue)]/10 to-[var(--pastel-green)]/10">
        <h2 className="text-4xl font-bold  bg-gradient-to-r from-red-300 via-50% to-green-200 via-blue-200 inline-block text-transparent bg-clip-text">今すぐサークルの予定調整を<br />楽にしましょう！</h2>
        <p className="mt-4">面倒な予定調整はもう終わり。<br />taplaで、みんなが笑顔になる時間を作りましょう。</p>

        <Link href="/create">
          <button className={styles.eventCreateButton}>
            無料で始める
          </button>
        </Link>
      </section>

      
    </>
  );
}
