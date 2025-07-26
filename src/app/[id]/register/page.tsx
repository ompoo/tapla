import {fetchEvent } from '../actions';
import { submitEventVote } from './actions';
import AutoSetData from './autoinput';

export default async function RegisterPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const result = await fetchEvent(id);
  
  if (!result.success || !result.data) {
    return (
      <div>
        <h1>エラー</h1>
        <p>イベントが見つかりませんでした</p>
      </div>
    );
  }

  const { event, dates, times } = result.data;

  return (
    <>
      <h1>イベント参加登録</h1>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      
      <form action={submitEventVote}>
        <input type="hidden" name="eventId" value={id} />
        
        <div>
          <label>
            名前
          </label>
          <input 
            type="text" 
            id="participantName"
            name="participantName"
            required 
          />
        </div>

        <h3>参加可能な日時を選択してください</h3>
        
        
        <AutoSetData dates={dates} times={times}/>

        <div>
          <button type="submit">
            登録する
          </button>
        </div>
      </form>
    </>
  );
}