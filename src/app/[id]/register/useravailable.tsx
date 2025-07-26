
import { createClient } from '@/utils/supabase/server';
import { time } from 'console';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

export interface UserAvailable {
  user_id: string,
  start_time: Timestamp,
  end_time: Timestamp,
}

export async function registeruseravailable(data: FormData,userId: string) {
    const supabase = await createClient();
    const formattedData = formatUserAvailableData(data, userId);
    console.log('Formatted User Available Data:', formattedData);
    // データをSupabaseに登録
    // const { error } = await supabase
    //     .from('user_availability_patterns')
    //     .insert(formattedData);

    // if (error) {
    //     console.error('Error registering user availability:', error);
    //     throw error;
    // }
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
    let cadidateDates:Map<string,Map<string,boolean>> = new Map();

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
        cadidateDates.set(date, timesForDate); // datelabelsではなくdateLabelをキーに使用
    }

    for (const [key, value] of data.entries()) {
        if(key.includes(`__`) && value == 'on') {
            const [dateLabel, timeLabel] = key.split('/')[0].split('__'); // labelで分割
            const times = cadidateDates.get(dateLabel);
            if (!times) {
                console.warn(`Date label ${dateLabel} not found in candidate dates.`);
                continue;
            }
            else{
                cadidateDates.get(dateLabel)?.set(timeLabel, true); // 時刻を利用可能としてマーク
            }
        }
    }

    console.log('Candidate Dates:', cadidateDates);


    for (const [dateLabel, times] of cadidateDates.entries()) {
        const [month, day] = dateLabel.split('-');
        let slot: UserAvailable | null = null;
        let startTime: Date | null = null;

        for (const [time, isAvailable] of times.entries()) {
            console.log(`Processing dateLabel: ${dateLabel}, time: ${time}, isAvailable: ${isAvailable}`);
            
            if (isAvailable) {
                // 利用可能時間の開始
                if (startTime === null) {
                    startTime = new Date();
                    startTime.setDate(parseInt(day));
                    startTime.setMonth(parseInt(month) - 1);
                    startTime.setFullYear(new Date().getFullYear());
                    const [setHours, setMinutes] = time.split(':');
                    startTime.setHours(parseInt(setHours));
                    startTime.setMinutes(parseInt(setMinutes));
                    startTime.setSeconds(0);
                    startTime.setMilliseconds(0);
                    
                    console.log(`Start time set to: ${startTime}`);
                }
                // 連続する利用可能時間は継続
            } else {
                // 利用可能時間の終了
                if (startTime !== null) {
                    const endTime = new Date();
                    endTime.setDate(parseInt(day));
                    endTime.setMonth(parseInt(month) - 1);
                    endTime.setFullYear(new Date().getFullYear());
                    const [setHours, setMinutes] = time.split(':');
                    endTime.setHours(parseInt(setHours));
                    endTime.setMinutes(parseInt(setMinutes));
                    endTime.setSeconds(0);
                    endTime.setMilliseconds(0);

                    slot = {
                        user_id: userId,
                        start_time: startTime.getTime(),
                        end_time: endTime.getTime(),
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
            endTime.setHours(endTime.getHours() + 1); // 1時間後
            
            slot = {
                user_id: userId,
                start_time: startTime.getTime(),
                end_time: endTime.getTime(),
            };
            console.log(`Creating final slot: ${JSON.stringify(slot)}`);
            formattedData.push(slot);
        }
    }

    return formattedData;
}