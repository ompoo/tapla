
import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { getuser } from '@/app/actions';
import styles from './page.module.css';

export interface CandidateData {
    dates: Map<string, Map<string, boolean>>;
}

export async function fetchUserAvailability(startday: string, endday: string , userId: string): Promise<{start_time: string, end_time: string}[] | undefined> {
    try {
        const supabase = await createClient();
        

        // startday と endday のフォーマットを確認してから処理
        console.log('Input dates:', { startday, endday });
        
        // date_label は "MM-DD" フォーマットと仮定
        const [startMonth, startDay] = startday.split('-').map(Number);
        const [endMonth, endDay] = endday.split('-').map(Number);
        
        // 月と日の値を検証
        if (isNaN(startMonth) || isNaN(startDay) || isNaN(endMonth) || isNaN(endDay) ||
            startMonth < 1 || startMonth > 12 || endMonth < 1 || endMonth > 12 ||
            startDay < 1 || startDay > 31 || endDay < 1 || endDay > 31) {
            console.error('Invalid date format:', { startday, endday });
            return [];
        }
        
        // 1970年のISO文字列として作成
        const startDateISO = `1970-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}T00:00:00.000Z`;
        const endDateISO = `1970-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}T23:59:59.999Z`;
        
        console.log(`Fetching availability for user ${userId}`);
        console.log(`Date range: ${startday} to ${endday}`);
        console.log(`ISO strings: ${startDateISO} to ${endDateISO}`);

        // ユーザーの利用可能時間を取得
        console.log('Executing Supabase query...');
        const { data, error } = await supabase
            .from('user_availability_patterns')
            .select('*')
            .eq('user_id', userId)
            .lt('start_time', endDateISO)   // パターンの開始時刻が範囲終了より前
            .gt('end_time', startDateISO); 

        if (error) {
            console.error('Supabase query error:', error);
            return [];
        }

        console.log('Supabase query successful, raw data:', data);

        // 結果をフィルタリング
        const filteredData: { start_time: string; end_time: string }[] = data?.filter(item => {
            const itemStart = new Date(item.start_time);
            const itemEnd = new Date(item.end_time);
            const queryStart = new Date(startDateISO);
            const queryEnd = new Date(endDateISO);
            
            // 時刻での重複判定
            return itemStart <= queryEnd && itemEnd >= queryStart;
        }) || [];

        console.log(`Found ${filteredData.length} availability patterns:`, filteredData);

        return filteredData;
        
    } catch (error) {
        console.error('Error in fetchUserAvailability:', error);
        return [];
    }
}


export function formatCandidateData(dates: any[], times: any[]) : Map<string, Map<string, boolean>>{
    const formattedData: Map<string, Map<string, boolean>> = new Map();

    for (const date of dates) {
        const timesMap = new Map<string, boolean>();
        for (const time of times) {
            timesMap.set(time.time_label, false);
        }
        formattedData.set(date.date_label, timesMap);
    }
    return formattedData;
}



export function setUserAvailabilityPattern(userAvailability: { start_time: string; end_time: string }[], candidateDates: Map<string, Map<string, boolean>>): Map<string, Map<string, boolean>> {
    console.log('Setting user availability pattern...');
    console.log('User availability:', userAvailability);
    console.log('Candidate dates:', candidateDates);

    // candidateDatesのコピーを作成
    const result = new Map(candidateDates);

    for (const [dateLabel, timesMap] of result.entries()) {
        const newTimesMap = new Map(timesMap);
        
        try {
            // dateLabel (例: "07-26") からISO文字列を作成
            const [month, day] = dateLabel.split('-').map(Number);
            const dateISO = `1970-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            for (const [timeLabel, _] of newTimesMap.entries()) {
                // timeLabel (例: "09:00") を時刻として設定
                const [hours, minutes] = timeLabel.split(':').map(Number);
                const timeISO = `${dateISO}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
                const timeDate = new Date(timeISO);

                // userAvailabilityの各パターンをチェック
                let isAvailable = false;
                for (const pattern of userAvailability) {
                    // データベースの時刻文字列にタイムゾーン情報がない場合、明示的にUTCとして扱う
                    const startTimeStr = pattern.start_time.includes('Z') ? pattern.start_time : pattern.start_time + 'Z';
                    const endTimeStr = pattern.end_time.includes('Z') ? pattern.end_time : pattern.end_time + 'Z';
                    
                    const startTime = new Date(startTimeStr);
                    const endTime = new Date(endTimeStr);

                    // 時刻が利用可能時間内にあるかチェック
                    if (timeDate >= startTime && timeDate < endTime) {
                        isAvailable = true;
                        console.log(`  ✓ ${timeLabel} is available!`);
                        break;
                    }
                }

                console.log(`Final result for ${dateLabel} ${timeLabel}: ${isAvailable}`);
                newTimesMap.set(timeLabel, isAvailable);
            }
        } catch (error) {
            console.error(`Error processing date ${dateLabel}:`, error);
            // エラーの場合はすべてfalseのまま
        }
        
        result.set(dateLabel, newTimesMap);
    }

    console.log('Result after setting availability:', result);
    return result;
}







export default async function AutoSetData({ dates, times}: { dates: any[], times: any[] }) {
    console.log('AutoSetData starting...');
    console.log('Received dates:', dates);
    console.log('Received times:', times);
    const supabase = await createClient();
    const user = await getuser();
    if (!user) {
        console.warn('No user found, skipping availability fetch');
        return renderTable(dates, times, formatCandidateData(dates, times));
    }
    
    // auth_user_idからdatabase user idを取得
    const { data: dbUser, error: dbUserError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

    if (dbUserError || !dbUser) {
        console.error('Error finding database user:', dbUserError);
        return renderTable(dates, times, formatCandidateData(dates, times));
    }
    
    try {
        const candidate = formatCandidateData(dates, times);
        console.log('Formatted candidate data:', candidate);
        /*
        {
            07-26: Map {
                '09:00' => false,
                '10:00' => false,
            }
        }
        */
        
        // 日付の安全性チェック
        if (!dates?.length || !times?.length) {
            console.log('No dates or times provided, using empty candidate data');
            return renderTable(dates || [], times || [], candidate);
        }

        const startday: string = dates[0]?.date_label;
        const endday: string = dates[dates.length - 1]?.date_label;
                
        if (!startday || !endday) {
            console.log('Invalid start or end day, using default table');
            return renderTable(dates, times, candidate);
        }
        
        console.log('Fetching user availability...');
        const userAvailabilitydata = await fetchUserAvailability(startday, endday, dbUser.id);
        console.log('User availability data received:', userAvailabilitydata);
        /*
        {
            start_time: '1970-07-26T09:00:00.000Z',
            end_time: '1970-07-26T12:00:00.000Z'
        }
        */

        // userAvailabilitydata が undefined の場合は空配列を使用
        const availabilityData = setUserAvailabilityPattern(userAvailabilitydata || [], candidate);
        console.log('Final availability data:', availabilityData);
        /*
        {
            07-26: Map {
                '09:00' => true,
                '10:00' => false,
            }
        }
        */
        
        return renderTable(dates, times, availabilityData);
        
    } catch (error) {
        console.error('Error in AutoSetData:', error);
        // エラーが発生した場合は、デフォルトのテーブルを表示
        try {
            const candidate = formatCandidateData(dates || [], times || []);
            return renderTable(dates || [], times || [], candidate);
        } catch (fallbackError) {
            console.error('Error in fallback rendering:', fallbackError);
            // 最終的なフォールバック
            return (
                <div>
                    <p>テーブルの表示でエラーが発生しました。</p>
                    <p>エラー: {error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
            );
        }
    }
}

function renderTable(dates: any[], times: any[], availabilityData: Map<string, Map<string, boolean>> | null) {
    return (
        <div className={styles.dateTimeTable}>
            {/* 日付ラベルのhidden input */}
            {dates.map((date) => (
                <input 
                    key={`date-label-${date.id}`}
                    type="hidden" 
                    name={`date-label-${date.id}`} 
                    value={date.date_label} 
                />
            ))}
            
            {/* 時刻ラベルのhidden input */}
            {times.map((time) => (
                <input 
                    key={`time-label-${time.id}`}
                    type="hidden" 
                    name={`time-label-${time.id}`} 
                    value={time.time_label} 
                />
            ))}

            <table>
                <thead>
                    <tr>
                        <th>時刻</th>
                        {dates.map((date) => (
                            <th key={date.id}>
                                {date.date_label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {times.map((time: any) => (
                        <tr key={time.id}>
                            <td>
                                {time.time_label}
                            </td>
                            {dates.map((date: any) => {
                                const key = `${date.date_label}__${time.time_label}/${date.id}__${time.id}`;
                                const isChecked = availabilityData ? availabilityData.get(date.date_label)?.get(time.time_label) : false;

                                return (
                                    <td key={key}>
                                        <input 
                                            type="checkbox" 
                                            name={key} 
                                            defaultChecked={isChecked}
                                        />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}