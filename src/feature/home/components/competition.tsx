'use client'
import PrimaryButton from '@/components/buttons/primary-button'
import { CustomDialog } from '@/components/global/custom-dialog'
import { Card } from '@/components/ui/card'
// Image converted to img tag
import { useState } from 'react'

export default function Competition() {
    const [open, setOpen] = useState(false)
    return (
        <div className='py-10'>
            <h2 className=' font-semibold text-2xl mb-5'>Mock Exam Competition</h2>
            <div className=' grid grid-cols-3 gap-5'>

                <Card className=' flex-row p-5'>
                    <img width={2000} height={2000} alt='exam' src={"/img/mock.png"} className='  w-full' />
                    <div className='  '>
                        <div>
                            <h1 className=' mb-3 text-sm font-medium'>Mock 2.0</h1>
                            <p className=' opacity-60 text-xs'>Participate in the exam competition for a chance to win a cash prize</p>
                        </div>
                        <CustomDialog className=' ' size='xl' title='' onOpenChange={(open) => setOpen(open)} open={open}
                            trigger={<PrimaryButton title='Take Mock Exam' className=' bg-black h-10 mt-4 hover:bg-black/50 text-white' />
                            }>
                            <div className=' max-w-sm  space-y-3 mx-auto text-center'>
                                <img width={2000} height={2000} alt='exam' src={"/img/mock.png"} className=' mx-auto h-28 w-28 ' />
                                <div>

                                    <h2 className='  text-lg font-medium'>Mock exam competition</h2>
                                    <p className=' opacity-60 '>Participate in the exam competition for a chance to win a cash prize. This is available for the next 48 hours, take time out to prepare for the exam before taking it or take it now.</p>
                                </div>
                                <PrimaryButton title='Start Mock Exam' className='h-12 text-white bg-[#F04F54] hover:bg-[#F04F54]/60' /></div>
                        </CustomDialog>
                    </div>
                </Card>

            </div>
        </div>
    )
}
