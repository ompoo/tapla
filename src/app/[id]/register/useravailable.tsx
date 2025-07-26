
import { createClient } from '@/utils/supabase/server';

export interface UserAvailable {
  user_id: string,
  start_time: string,
  end_time: string,
}

export async function registeruseravailable(data: FormData,userId: string) {
    const supabase = await createClient();
    const formattedData = formatUserAvailableData(data, userId);
    console.log('Formatted User Available Data:', formattedData);
    //データをSupabaseに登録
    const { error } = await supabase
        .from('user_availability_patterns')
        .insert(formattedData);

    if (error) {
        console.error('Error registering user availability:', error);
        throw error;
    }
}


/*
* ユーザーの利用可能時間をフォーマットする
* @param data - フォームデータ
* @return フォーマットされたユーザーの利用可能時間の配列
* @param userId - ユーザーID
* @return フォーマットされたユーザーの利用可能時間の配列
*/
export function formatUserAvailableData(data: FormData, userId: string): UserAvailable[] {
    const formattedData: UserAvailable[] = [];
    let dates:Set<string> = new Set();
    let times:Set<string> = new Set();
    let candidateDates:Map<string,Map<string,boolean>> = new Map();

    for (const [key, value] of data.entries()) {

        if (key.startsWith('date-label-')){
            const datelabels = value as string; // valueを使用（date-label-{id}のvalueにdate_labelが入っている）
            dates.add(datelabels);
        }
        else if (key.startsWith('time-label-')) {
            const time = value as string; // valueを使用（time-label-{id}のvalueにtime_labelが入っている）
            times.add(time);
        }
    }

    console.log('Dates:', Array.from(dates));
    console.log('Time Labels:', Array.from(times));

    const sortedTimes = Array.from(times).sort((a, b) => {
        // timeで順序付け（必要に応じて時刻順にソート）
        return a.localeCompare(b);
    });
    // 日付と時刻のペアを作成（各日付ごとに独立したtimes Mapのコピーを作成）
    for (const date of dates) {
        const timesForDate = new Map(sortedTimes.map((time) => [time, false])); // times Mapのコピーを作成
        candidateDates.set(date, timesForDate); // datelabelsではなくdateLabelをキーに使用
    }

    for (const [key, value] of data.entries()) {
        if(key.includes(`__`) && value == 'on') {
            const [dateLabel, timeLabel] = key.split('/')[0].split('__'); // labelで分割
            const times = candidateDates.get(dateLabel);
            if (!times) {
                console.warn(`Date label ${dateLabel} not found in candidate dates.`);
                continue;
            }
            else{
                candidateDates.get(dateLabel)?.set(timeLabel, true); // 時刻を利用可能としてマーク
            }
        }
    }

    console.log('Candidate Dates:', candidateDates);


    for (const [dateLabel, times] of candidateDates.entries()) {
        const [month, day] = dateLabel.split('-');
        let slot: UserAvailable | null = null;
        let startTime: Date | null = null;

        for (const [time, isAvailable] of times.entries()) {
            console.log(`Processing dateLabel: ${dateLabel}, time: ${time}, isAvailable: ${isAvailable}`);
            
            if (isAvailable) {
                // 利用可能時間の開始
                if (startTime === null) {
                    // 1970年UTCでの日付作成
                    const [setHours, setMinutes] = time.split(':');
                    startTime = new Date(Date.UTC(1970, parseInt(month) - 1, parseInt(day), parseInt(setHours), parseInt(setMinutes), 0, 0));
                    
                    console.log(`Start time set to: ${startTime.toISOString()}`);
                }
                // 連続する利用可能時間は継続
            } else {
                // 利用可能時間の終了
                if (startTime !== null) {
                    // 1970年UTCでの日付作成
                    const [setHours, setMinutes] = time.split(':');
                    const endTime = new Date(Date.UTC(1970, parseInt(month) - 1, parseInt(day), parseInt(setHours), parseInt(setMinutes), 0, 0));

                    slot = {
                        user_id: userId,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                    };
                    console.log(`Creating slot: ${JSON.stringify(slot)}`);
                    formattedData.push(slot);
                    
                    // リセット
                    startTime = null;
                    slot = null;
                }
                
            }
        }

        // ループの最後で残った slot を処理（最後まで利用可能な場合）
        if (startTime !== null) {
            // 最後の時刻の1時間後を終了時間とする
            const endTime = new Date(startTime);
            endTime.setUTCHours(endTime.getUTCHours() + 1); // 1時間後（UTC）
            
            slot = {
                user_id: userId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
            };
            console.log(`Creating final slot: ${JSON.stringify(slot)}`);
            formattedData.push(slot);
        }
    }

    return formattedData;
}