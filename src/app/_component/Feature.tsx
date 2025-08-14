import { Shield, Brain, Users, Clock, Smartphone, Zap } from "lucide-react";

export default function Feature() {
     const features = [
    {
      icon: Shield,
      title: "認証機能",
      description: "安全にログインして、あなたの予定データを保護します",
      gradient: "from-[#ff9eb5] to-[#ffcc9a]"
    },
    {
      icon: Brain,
      title: "自動入力",
      description: "過去の投票パターンを学習して、次回は自動で入力します",
      gradient: "from-[#a7d8f0] to-[#ddd6fe]"
    },
    {
      icon: Users,
      title: "サークル向け",
      description: "大学生のサークル活動に最適化された使いやすいデザイン",
      gradient: "from-[#b4e7ce] to-[#a7d8f0]"
    },
    {
      icon: Clock,
      title: "リアルタイム更新",
      description: "投票結果がリアルタイムで更新され、すぐに結果が分かります",
      gradient: "from-[#ffd93d] to-[#ffcc9a]"
    },
    {
      icon: Smartphone,
      title: "モバイル対応",
      description: "スマートフォンでも使いやすい、レスポンシブデザイン",
      gradient: "from-[#ddd6fe] to-[#ff9eb5]"
    },
    {
      icon: Zap,
      title: "高速処理",
      description: "タップしてすぐに反映。ストレスフリーな操作体験",
      gradient: "from-[#ffcc9a] to-[#ffd93d]"
    }
  ];
    return (
      <section id="features" className="text-center mt-20 px-3 container mx-auto">
        <h2 className="text-4xl bg-gradient-to-r to-green-200  from-blue-300 inline-block text-transparent bg-clip-text">主な特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-center gap-8 mt-8 mx-auto">
        {features.map((feature, index) => (
            <div key={index}>
                <Card>
                    <div className={`h-2 w-full mb-3 bg-gradient-to-r ${feature.gradient} rounded-t-lg`}/>
                    
                    <CardContent className="p-8">
                        <div className="">
                            <div 
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mx-auto mb-6`}
                            >
                                <feature.icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold mb-4 text-center">{feature.title}</h3>
                        <p className="text-center">
                            {feature.description}
                        </p>
                    </div>
                    </CardContent>
                </Card>
            </div>
        ))}
        </div>

      </section>
    );
}



import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div className={`rounded-lg border-none bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {children}
    </div>
  );
}

