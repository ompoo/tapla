
import { createClient } from '@/utils/supabase/server';
import { type UserAvailable } from './useravailable';

export async function updateUserAvailable(userAvailability: UserAvailable[], userId: string, startDateISO: string, endDateISO: string) {

    const supabase = await createClient();

    console.log(`Updating user availability for user ${userId}`);
    console.log(`Date range: ${startDateISO} to ${endDateISO}`);
    console.log(`New patterns:`, userAvailability);

    // 1. 影響範囲の既存パターンを取得（マージ用）
    console.log('Fetching existing patterns that might be affected...');
    const { data: existingPatterns, error: fetchError } = await supabase
        .from('user_availability_patterns')
        .select('*')
        .eq('user_id', userId)
        .lt('start_time', endDateISO)   // パターンの開始時刻が範囲終了より前
        .gt('end_time', startDateISO);  // パターンの終了時刻が範囲開始より後

    if (fetchError) {
        console.error('Error fetching existing patterns:', fetchError);
        throw fetchError;
    }

    console.log('Existing patterns to merge:', existingPatterns);

    // 2. マージ処理: 既存パターンと新規パターンを統合
    const mergedPatterns = mergeAvailabilityPatterns(
        existingPatterns || [], 
        userAvailability, 
        startDateISO, 
        endDateISO
    );

    console.log('Merged patterns:', mergedPatterns);

    // 3. 影響範囲の既存パターンを削除
    console.log('Deleting existing patterns in the affected range...');
    const { error: deleteError } = await supabase
        .from('user_availability_patterns')
        .delete()
        .eq('user_id', userId)
        .lt('start_time', endDateISO)
        .gt('end_time', startDateISO);

    if (deleteError) {
        console.error('Error deleting existing patterns:', deleteError);
        throw deleteError;
    }

    // 4. マージされたパターンを挿入
    if (mergedPatterns.length > 0) {
        console.log(`Inserting ${mergedPatterns.length} merged patterns...`);
        const { error: insertError } = await supabase
            .from('user_availability_patterns')
            .insert(mergedPatterns);

        if (insertError) {
            console.error('Error inserting merged patterns:', insertError);
            throw insertError;
        }
        
        console.log('User availability patterns updated successfully with merge');
    } else {
        console.log('No patterns to insert after merge');
    }
}

/**
 * 既存パターンと新規パターンをマージする
 */
function mergeAvailabilityPatterns(
    existingPatterns: any[], 
    newPatterns: UserAvailable[], 
    updateStartISO: string, 
    updateEndISO: string
): UserAvailable[] {
    const merged: UserAvailable[] = [];
    
    // 1. 既存パターンから更新範囲外の部分を抽出
    for (const existing of existingPatterns) {
        const existingStart = new Date(existing.start_time);
        const existingEnd = new Date(existing.end_time);
        const updateStart = new Date(updateStartISO);
        const updateEnd = new Date(updateEndISO);
        
        // 更新範囲より前の部分
        if (existingStart < updateStart) {
            merged.push({
                user_id: existing.user_id,
                start_time: existing.start_time,
                end_time: existingEnd <= updateStart 
                    ? existing.end_time 
                    : updateStartISO
            });
        }
        
        // 更新範囲より後の部分
        if (existingEnd > updateEnd) {
            merged.push({
                user_id: existing.user_id,
                start_time: existingStart >= updateEnd 
                    ? existing.start_time 
                    : updateEndISO,
                end_time: existing.end_time
            });
        }
    }
    
    // 2. 新規パターンを追加
    merged.push(...newPatterns);
    
    // 3. 時間順にソート
    merged.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
    console.log('Merge process:', {
        existing: existingPatterns.length,
        new: newPatterns.length,
        merged: merged.length
    });
    
    return merged;
}