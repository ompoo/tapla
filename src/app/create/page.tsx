'use client';
import { useState, useEffect } from "react";
import { formatDate , createDateArray,createTimeArray } from "@/utils/format/times";
import { createEvent } from "./actions";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import BackgroundPattern from "@/utils/BackGroundPattern";


export default function createEventPage() {
  
  const router = useRouter(); // useRouterフックを追加
  
  const start_day = new Date();
  const end_day = new Date();
  end_day.setDate(start_day.getDate() + 5);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [startDate, setStartDate] = useState(formatDate(start_day));
  const [endDate, setEndDate] = useState(formatDate(end_day));

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [rows, setRows] = useState(['']); // 縦軸：時間
  const [cols, setCols] = useState(['']); // 横軸：日付

  // 横軸（日付リスト）を自動更新する
  useEffect(() => {
    if (!startDate || !endDate) return;
    
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    if (currentDate > lastDate) {
      //todo: enddateを赤枠で表示
      return;
    }

    const dates = createDateArray(currentDate, lastDate);
    
    setCols(dates); // 横軸に日付を設定
  }, [startDate, endDate]);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    if (startTotalMinutes > endTotalMinutes) {
      // todo: endtimeを赤枠で表示
      return;
    }
    
    const times = createTimeArray(startTotalMinutes, endTotalMinutes);
    setRows(times); // 縦軸に時間を設定
  }, [startTime, endTime]);

  const handleCreate = async () => {
    
    try {
      // 基本情報の検証
      if (!title.trim()) {
        alert('タイトルを入力してください');
        return;
      }

      // 入力データを整理（空文字列を除去）
      const filteredDates = cols.filter(date => date.trim() !== '');
      const filteredTimes = rows.filter(time => time.trim() !== '');

      if (filteredDates.length === 0 || filteredTimes.length === 0) {
        alert('候補日と候補時刻を少なくとも1つずつ入力してください');
        return;
      }

      const result = await createEvent({
        eventData: {
          title,
          description,
          creator_id: undefined // Server Actionで自動的に設定される
        },
        dates: filteredDates.map(date => ({
          date_label: date, // 日付のラベル（例: "10-01"）
          col_order: filteredDates.indexOf(date) + 1 // 列の順序
        })),
        times: filteredTimes.map((time, index) => ({
          time_label: time, // 時間のラベル（例: "09:00"）
          row_order: index + 1 // 行の順序
        }))
      });
      
      if (result.success) {
        router.push(`/${result.eventId}`);
      } else {
        throw new Error(result.error || 'イベントの作成に失敗しました');
      }
      
    } catch (error) {
      console.error('Event creation error:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
    }
  };


  return (
    <div className="min-h-screen">
      <BackgroundPattern className="blur-2xl" />
      <h1 className="mt-12 mx-auto w-fit text-center text-4xl font-bold bg-gradient-to-r from-[var(--pastel-pink)] to-[var(--pastel-blue)] bg-clip-text text-transparent">
        予定候補日を作成
      </h1>

      <div className="mt-12 mx-auto flex gap-12 container px-3">
        <div className="flex-1 flex flex-col text-center">
          <label htmlFor="event-name">イベント名</label>
          <input 
            id="event-name"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="flex-1 flex flex-col text-center">
          <label htmlFor="event-description">イベント説明</label>
          <textarea 
            id="event-description"
            value={description} 
          onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="mx-auto container">
        <div className="mt-12 mx-auto flex gap-12 w-full">
          <div className="">
            <div className="max-w-44 flex flex-col text-center">
              <label htmlFor="start-date">開始日</label>
            <input 
              id="start-date"
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            </div>
            <div className="max-w-44 flex flex-col text-center">
              <label htmlFor="end-date">終了日</label>
              <input 
                id="end-date"
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <table className="text-center mx-auto">
              <thead>
                <tr>
                  <th className="">日付</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, index) => (
                  <tr key={index}>
                    <td>
                      {col}
                      <input
                        type="text"
                        value={col}
                        hidden
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="">
            <div className="max-w-44 flex flex-col text-center">
              <label htmlFor="start-time">開始時刻</label>
              <input 
                id="start-time"
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="max-w-44 flex flex-col text-center">
              <label htmlFor="end-time">終了時刻</label>
              <input 
                id="end-time"
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <table className="text-center mx-auto">
              <thead>
                <tr>
                  <th>時間</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      {row}
                      <input
                        type="text"
                        value={row}
                        hidden
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full overflow-auto">
            <p className="text-center">プレビュー</p>
            <div className="w-full overflow-x">
              <table className="text-center mx-auto p-8 w-full">
              <thead>
                <tr className={styles.tableHeader}>
                  <th>時刻</th>
                  {cols.map((col,index) => (
                    <th key={index}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {rows.map((row,index) => (
                <tr key= {index}>
                  <td>
                    {row}
                  </td>
                  {cols.map((col,index) => {
                      return (
                        <td key={index}>
                          <input 
                            type="checkbox" 
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
            </div>
            
        </div>
      </div>
      </div>

      <button
        onClick={handleCreate}   
        className="mt-12 block mx-auto bg-[var(--pastel-pink)] text-white py-2 px-4 rounded-4xl"
      >
        イベントを作成
      </button>
    </div>
  );
}
