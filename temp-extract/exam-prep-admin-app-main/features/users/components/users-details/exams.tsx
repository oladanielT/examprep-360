import { SmallStatsCard } from '@/components/cards/small-stats-card';
import React from 'react'

const Exams = () => {
    return (
        <div className="  gap-5  grid grid-cols-3">
            <SmallStatsCard
                containerClassName=" "
                amountClassName=" text-lg"
                title="6 Subjects"
                amount="WAEC EXAM"
            />
            <SmallStatsCard
                containerClassName=""
                amountClassName=" text-lg"
                title="6 Subjects"
                amount="WAEC EXAM"
            />
            <SmallStatsCard
                containerClassName=" "
                amountClassName=" text-lg"
                title="6 Subjects"
                amount="WAEC EXAM"
            />
            <SmallStatsCard
                containerClassName=""
                amountClassName=" text-lg"
                title="6 Subjects"
                amount="WAEC EXAM"
            />
        </div>
    );
}

export default Exams