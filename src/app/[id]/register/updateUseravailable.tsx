
import { createClient } from '@/utils/supabase/server';
import { type UserAvailable } from './useravailable';

export async function updateUserAvailable(userAvailability: UserAvailable[], userId: string, startDateISO: string, endDateISO: string) {

    const supabase = await createClient();

    console.log(`Updating user availability for user ${userId}`);
    console.log(`Date range: ${startDateISO} to ${endDateISO}`);
    console.log(`New patterns:`, userAvailability);

    // 1. 指定期間の既存パターンを削除
    console.log('Deleting existing patterns in the specified range...');
    const { error: deleteError } = await supabase
        .from('user_availability_patterns')
        .delete()
        .eq('user_id', userId)
        .gte('start_time', startDateISO)
        .lte('end_time', endDateISO);

    if (deleteError) {
        console.error('Error deleting existing patterns:', deleteError);
        throw deleteError;
    }

    // 2. 新しいパターンを挿入
    if (userAvailability.length > 0) {
        console.log(`Inserting ${userAvailability.length} new patterns...`);
        const { error: insertError } = await supabase
            .from('user_availability_patterns')
            .insert(userAvailability);

        if (insertError) {
            console.error('Error inserting new patterns:', insertError);
            throw insertError;
        }
        
        console.log('User availability patterns updated successfully');
    } else {
        console.log('No new patterns to insert (clearing existing patterns only)');
    }
}