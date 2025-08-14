

export default function BackgroundPattern() {
  const shapes = [
    // 大きな四角形たち
    { size: "w-32 h-32", color: "bg-red-200/30", position: "top-20 left-10", rotation: 15 },
    { size: "w-40 h-28", color: "bg-blue-200/30", position: "top-40 right-20", rotation: -20 },
    { size: "w-28 h-36", color: "bg-green-200/30", position: "bottom-32 left-1/4", rotation: 25 },
    { size: "w-36 h-24", color: "bg-yellow-200/30", position: "bottom-20 right-1/3", rotation: -15 },
    { size: "w-24 h-32", color: "bg-purple-200/30", position: "top-1/2 left-12", rotation: 30 },

    // 中サイズの四角形たち
    { size: "w-20 h-20", color: "bg-red-100/30", position: "top-60 left-1/2", rotation: 45 },
    { size: "w-16 h-24", color: "bg-blue-100/30", position: "bottom-60 right-1/4", rotation: -35 },
    { size: "w-24 h-16", color: "bg-green-100/30", position: "top-1/4 left-1/3", rotation: 20 },
    { size: "w-18 h-18", color: "bg-yellow-100/30", position: "bottom-1/3 left-20", rotation: -40 },

    // 小さな四角形たち
    { size: "w-12 h-12", color: "bg-purple-50/30", position: "top-80 right-40", rotation: 60 },
    { size: "w-10 h-14", color: "bg-peach-50/30", position: "bottom-80 left-40", rotation: -50 },
    { size: "w-14 h-10", color: "bg-pink-50/30", position: "top-1/2 right-1/4", rotation: 35 },
    { size: "w-8 h-12", color: "bg-blue-50/30", position: "bottom-1/4 right-40", rotation: -45 },
  ];

  return (
    <div className="-z-50 fixed inset-0 pointer-events-none overflow-hidden">
      {shapes.map((shape, index) => (
        <div
          key={index}
          className={`absolute ${shape.size} ${shape.color} ${shape.position}  rounded-2xl`}
          style={{ transform: `rotate(${shape.rotation}deg)` }}
        />
      ))}
    </div>
  );
}