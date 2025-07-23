import { formatUserAvailability } from "./formatUserAvailability"
import { parseFormdata } from '@/utils/format/voteFormParser';

export interface registerUserAvailabilityData{
    user_id: string | null;
    start_timestamp: string;
    end_timestamp: string;
}

export function registerUserAvailability(
    formData: FormData,
    userId: string | null = null
):registerUserAvailabilityData[]{
    const { votes, eventId } = parseFormdata(formData);

    const registerData = formatUserAvailability(
        userId,
        votes.date_labels,
        votes.time_labels,
        votes.is_available
    );

    const data = registerData.map((vote) => ({
        user_id: vote.userId,
        start_timestamp: vote.startTImeStamp,
        end_timestamp: vote.endTimeStamp,
    }));
    
    return data;
}