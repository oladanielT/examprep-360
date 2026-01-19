import { CustomTabs } from '@/components/custom/custom-tab'
import Paused from './paused'

export default function Completed() {
    return (
        <CustomTabs listClassName='  h-fit!   border-b   max-w-md h-full gap-0 items-start'
            triggerClassName='data-[state=active]:border-b-2 
             p-5 data-[state=active]:text-[#F04F54] data-[state=active]:bg-transparent
              text-gray-400  py-3 border-0 data-[state=active]:border-[#F04F54] h-auto text-sm w-1/2 '
            className='w-full!   gap-10    space-y-0     h-full! ' tabs={[

                {
                    value: "Practice Exams",
                    label: 'Practice Exams',
                    content: <Paused />
                },
                {
                    value: "Mock Exams",
                    label: 'Mock Exams',
                    content: <Paused />
                },
            ]} />
    )
}
