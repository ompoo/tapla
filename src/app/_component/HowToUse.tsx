import { Plus, MousePointer, BarChart3 } from "lucide-react";

export default function HowToUse() {
    const steps = [
    {
      icon: Plus,
      title: "予定を作成",
      description: "予定作成者が候補日と候補時間を入力します",
      color: "bg-red-100",
      bgColor: "bg-red-100/30"
    },
    {
      icon: MousePointer,
      title: "タップで参加",
      description: "参加者は表をタップするだけで参加可能時間を共有できます",
      color: "bg-blue-100",
      bgColor: "bg-blue-100/30"
    },
    {
      icon: BarChart3,
      title: "結果を確認",
      description: "全員が参加可能な日時をリアルタイムで確認できます",
      color: "bg-green-100",
      bgColor: "bg-green-100/30"
    }
  ];

    return (
        <section id="how-to-use" className="text-center">
            <h2 className="text-3xl bg-gradient-to-r from-red-300  to-blue-200 inline-block text-transparent bg-clip-text">使い方</h2>
            <p className="mt-4">3ステップで簡単に予定調整</p>

            <div className="flex items-center justify-center gap-8 mt-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (

              <div key={index} className="relative flex-1">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-red-300  to-blue-200 text-white text-center justify-center items-center flex">
                  {index + 1}
                </div>
                
                <Card className={`h-full ${step.bgColor} border-none shadow-lg transition-all duration-300`}>
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                    >
                      <step.icon className="w-8 h-8 " />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
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
    <div className={`rounded-lg border p-4 ${className}`}>
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
