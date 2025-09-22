
interface InputCardProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
    startTime: string;
    setStartTime: (value: string) => void;
    endTime: string;
    setEndTime: (value: string) => void;

}

export default function InputCard({
  title,
  setTitle,
  description,
  setDescription,
  startDate,
  setStartDate,
  endDate,
  setEndDate
    ,startTime,
    setStartTime,
    endTime,
    setEndTime
}: InputCardProps) {
    return (
        <>
      <div className="flex justify-center">
        <div className="flex flex-col space-y-4">
        <label htmlFor="event-name">イベント名</label>
        <input 
          id="event-name"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="event-description">イベント説明</label>
        <textarea 
          id="event-description"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
        />
        </div>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <label htmlFor="start-date">開始日</label>
        <input 
          id="start-date"
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="end-date">終了日</label>
        <input 
          id="end-date"
          type="date" 
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
       <div className="flex justify-center items-center space-x-4">
        <label htmlFor="start-time">開始時刻</label>
        <input 
          id="start-time"
          type="time" 
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <label htmlFor="end-time">終了時刻</label>
        <input 
          id="end-time"
          type="time" 
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      </>
    );
}