'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getuser } from '@/app/actions';
import {parseFormdata} from '@/utils/format/voteFormParser';
import { formatUserAvailability } from '@/utils/format/recfactor/formatUserAvailability';

export async function registerVote(formData: FormData) {
    const supabase = await createClient();

    const eventId = formData.get('eventId') as string;
    const participantName = formData.get('participantName') as string;

    const registerUser = await getuser();

    try {
        if (!eventId || !participantName.trim()) {
            throw new Error('必要な情報が不足しています');
        }

        // 1. 既存ユーザーをチェックまたは新規作成
        let user;
        
        if (registerUser?.id) {
            // 認証ユーザーの場合、既存ユーザーをチェック
            const { data: existingUser } = await supabase
                .from('users')
                .select()
                .eq('auth_user_id', registerUser.id)
                .single();

            if (existingUser) {
                user = existingUser;
            } else {
                // 認証ユーザーだが、usersテーブルにレコードがない場合は新規作成
                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert([{ 
                        name: participantName.trim(),
                        auth_user_id: registerUser.id
                    }])
                    .select()
                    .single();

                if (userError) {
                    console.error('Error creating authenticated user:', userError);
                    throw new Error('ユーザーの登録に失敗しました');
                }
                user = newUser;
            }
        } else {
            // 非認証ユーザーの場合は新規作成
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert([{ 
                    name: participantName.trim(),
                    auth_user_id: null
                }])
                .select()
                .single();

            if (userError) {
                console.error('Error creating anonymous user:', userError);
                throw new Error('ユーザーの登録に失敗しました');
            }
            user = newUser;
        }

        const {votes} = parseFormdata(formData);

        // 投票データを効率的に作成（O(n)）
        const voteRecords = votes.date_ids.flatMap((dateId, dateIndex) =>
            votes.time_ids.flatMap((timeId, timeIndex) =>
                votes.is_available[dateIndex][timeIndex] ? [{
                    user_id: user.id,
                    event_id: eventId,
                    event_date_id: dateId,
                    event_time_id: timeId,
                    is_available: true
                }] : []
            )
        );

        // 投票データを一括登録
        if (voteRecords.length > 0) {
            const { data: voted, error: votedError } = await supabase
                .from('votes')
                .insert(voteRecords);

            if (votedError) {
                console.error('Error creating votes:', votedError);
                throw new Error('投票の登録に失敗しました');
            }
        }

        

        revalidatePath(`/${eventId}`);

        const uservailabilityregister = formatUserAvailability(
            user.id,
            votes.date_labels,
            votes.time_labels,
            votes.is_available
        )

        console.log('User availability data to register:', uservailabilityregister);

        // const { data: userAvailabilityData, error: userAvailabilityError } = await supabase
        //     .from('user_availability')
        //     .insert(uservailabilityregister.map(vote => ({
        //         user_id: vote.userId,
        //         start_timestamp: vote.startTImeStamp,
        //         end_timestamp: vote.endTimeStamp
        //     })));
        // if (userAvailabilityError) {
        //     console.error('Error creating user availability:', userAvailabilityError);
        //     throw new Error('ユーザーの利用可能時間の登録に失敗しました');
        // }

        
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
    
    redirect(`/${eventId}`);
}