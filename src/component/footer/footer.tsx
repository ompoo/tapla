import styles from "./footer.module.css";
import { Calendar, Heart } from "lucide-react";
export default function Footer() {
  return (
     <footer className="bg-white py-12">
      <div className="mx-auto px-4 container">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-[var(--pastel-pink)] flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold bg-gradient-to-r from-[var(--pastel-pink)] to-[var(--pastel-blue)] bg-clip-text text-transparent">
            tapla
          </span>
        </div>
            
        <p className="mb-4 ml-14">
          サークルの予定調整を簡単に。<br />
          大学生のみんながもっと楽しい時間を過ごせるように。
        </p>
          {/* Links
          <div>
            <h4 className="font-semibold mb-4">プロダクト</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">使い方</a></li>
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">特徴</a></li>
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">価格</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">ヘルプ</a></li>
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">お問い合わせ</a></li>
              <li><a href="#" className="hover:text-[var(--pastel-pink)] transition-colors">プライバシー</a></li>
            </ul>
          </div> */}
       
        
        <div className=" flex items-center justify-center container">
          <p className="text-muted-foreground text-sm flex-1 text-center">
            © 2025 tapla. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex-1  mt-4 md:mt-0 text-center">
            Made with for university students
          </p>
        </div>
      </div>
    </footer>
  );
}
