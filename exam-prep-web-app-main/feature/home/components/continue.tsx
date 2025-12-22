import { Card } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'
import { Progress } from "@/components/ui/progress"
import PrimaryButton from '@/components/buttons/primary-button'

export default function Continue() {
    return (
        <div>
            <h2 className=' font-semibold text-2xl mb-5'>Jump back in</h2>
            <div className=' grid grid-cols-3 gap-5'>

                <Card>
                    <Image width={2000} height={2000} alt='exam' src={"/img/dummy.png"} className=' h-28 w-full' />
                    <div className='px-5  space-y-5'>
                        <div>
                            <h1 className=' font-medium'>Further Mathematics</h1>
                            <p className=' opacity-60'>Real World Algebra</p>
                        </div>
                        <Progress value={33} />
                        <PrimaryButton title='Continue' className=' bg-black hover:bg-black/50 text-white' />
                    </div>
                </Card>
                <Card>
                    <Image width={2000} height={2000} alt='exam' src={"/img/dummy.png"} className=' h-28 w-full' />
                    <div className='px-5  space-y-5'>
                        <div>
                            <h1 className=' font-medium'>Further Mathematics</h1>
                            <p className=' opacity-60'>Real World Algebra</p>
                        </div>
                        <Progress value={33} />
                        <PrimaryButton title='Continue' className=' bg-black hover:bg-black/50 text-white' />
                    </div>
                </Card>
                <Card>
                    <Image width={2000} height={2000} alt='exam' src={"/img/dummy.png"} className=' h-28 w-full' />
                    <div className='px-5  space-y-5'>
                        <div>
                            <h1 className=' font-medium'>Further Mathematics</h1>
                            <p className=' opacity-60'>Real World Algebra</p>
                        </div>
                        <Progress value={33} />
                        <PrimaryButton title='Continue' className=' bg-black hover:bg-black/50 text-white' />
                    </div>
                </Card>
            </div>
        </div>
    )
}
