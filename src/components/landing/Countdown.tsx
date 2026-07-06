"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: Date;
}

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calcTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

function Pad({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-drop-orange bg-slate-900 text-lg font-black text-drop-orange sm:h-16 sm:w-16 sm:text-xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div>
      <p className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
        ドロップ開始まで
      </p>
      <div className="flex gap-3 sm:gap-4">
        <Pad value={time.days} label="日" />
        <span className="self-start pt-4 text-drop-orange">:</span>
        <Pad value={time.hours} label="時間" />
        <span className="self-start pt-4 text-drop-orange">:</span>
        <Pad value={time.minutes} label="分" />
        <span className="self-start pt-4 text-drop-orange">:</span>
        <Pad value={time.seconds} label="秒" />
      </div>
    </div>
  );
}
