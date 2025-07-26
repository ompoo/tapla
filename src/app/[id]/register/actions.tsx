'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getuser } from '@/app/actions';
import { registeruseravailable } from './useravailable';

export async function submitEventVote(formData: FormData) {
    const supabase = await createClient();

    const eventId = formData.get('eventId') as string;
    const participantName = formData.get('participantName') as string;

    const registerUser = await getuser();

    try {
        if (!eventId || !participantName.trim()) {
            throw new Error('必要な情報が不足しています');
        }

        let voteuser = null;
        let databaseUserId = null; // 元のusersテーブルのユーザーIDを保持

        if (registerUser) {
            const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', registerUser.id)
            .single();

            // usersテーブルからユーザー情報を取得（auth_user_idで検索）
            if (userError || !user) {
                console.error('Error finding user:', userError);
                throw new Error('ユーザー情報の取得に失敗しました');
            }

            // ユーザーが存在する場合はvoteuserに設定
            voteuser = user;
            databaseUserId = user.id; // 元のユーザーIDを保持
        }
        else {
            console.warn('ログインしていません');
        }


        // イベントへの投票ユーザーとして登録
        
        if (voteuser) {
            const { data: voteuserData, error: voteUserError } = await supabase
                .from('voteuser')
                .insert([{ 
                    userid: voteuser.id, // ユーザーID
                    userlabel: participantName, // 参加者表示名
                    voteid: eventId // 投票ID
                }])
                .select()
                .single();

            if (voteUserError) {
                console.error('Error creating vote user:', voteUserError);
                throw new Error('投票ユーザーの登録に失敗しました');
            }
            
            voteuser = voteuserData;
        }
        else {
            console.warn('非認証ユーザーとして登録します。');
        }

        // 2. 投票データを収集
        const votes = [];
        for (const [key, value] of formData.entries()) {
            if (key.includes('__') && value === 'on') {
                // key形式: "07-26__09:00/date_id__time_id"
                const parts = key.split('/');
                if (parts.length === 2) {
                    const [_, idPart] = parts;
                    const [dateId, timeId] = idPart.split('__');
                    
                    console.log(`Processing vote: dateId=${dateId}, timeId=${timeId}`);
                    
                    votes.push({
                        voteuser_id: voteuser ? voteuser.id : null,
                        event_id: eventId,
                        event_date_id: dateId,
                        event_time_id: timeId,
                        is_available: true
                    });
                } else {
                    console.warn(`Invalid key format: ${key}`);
                }
            }
        }

        // 3. 投票データを一括保存
        if (votes.length > 0) {
            const { error: votesError } = await supabase
                .from('votes')
                .insert(votes);

            if (votesError) {
                console.error('Error saving votes:', votesError);
                throw new Error('投票の保存に失敗しました');
            }
        }

        if(registerUser && databaseUserId) {
            try {
                // ユーザーの利用可能時間を登録（database user IDを使用）
                await registeruseravailable(formData, databaseUserId);
                console.log('User availability patterns registered successfully');
            } catch (error) {
                console.error('Error registering user availability patterns:', error);
                // 利用可能時間の登録に失敗してもメインの投票は成功させる
            }

        }


        // 4. キャッシュを再検証
        revalidatePath(`/${eventId}`);
        revalidatePath(`/${eventId}/register`);

    } catch (error) {
        console.error('Unexpected error in submitEventVote:', error);
        throw new Error('予期しないエラーが発生しました');
    }
    
    redirect(`/${eventId}`);
}

