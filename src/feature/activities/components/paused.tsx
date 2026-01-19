import CustomCard from '@/components/global/custom-card'

export default function Paused() {
    return (
        <div className=' grid grid-cols-3 gap-5'>
          
            <CustomCard src='/img/jamb.png' imgClassName=' w-24 '>
                <div>
                    <h6 className=' text-lg  font-medium text-center pt-2'>English Language</h6>
                    <p className=' text-gray-400  text-center'>2025</p>
                </div>
            </CustomCard>
            <CustomCard src='/img/jamb.png' imgClassName=' w-24 '>
                <div>
                    <h6 className=' text-lg  font-medium text-center pt-2'>English Language</h6>
                    <p className=' text-gray-400  text-center'>2025</p>
                </div>
            </CustomCard>
            <CustomCard src='/img/jamb.png' imgClassName=' w-24 '>
                <div>
                    <h6 className=' text-lg  font-medium text-center pt-2'>English Language</h6>
                    <p className=' text-gray-400  text-center'>2025</p>
                </div>
            </CustomCard>
        </div>
    )
}
