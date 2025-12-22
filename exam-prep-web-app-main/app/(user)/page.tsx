import CustomPageHeader from '@/components/global/custom-page-header'
import Competition from '@/feature/home/components/competition'
import Continue from '@/feature/home/components/continue'
import Stat from '@/feature/home/components/stat'

export default function Page() {
  return (
    <div className=''>
      <CustomPageHeader heading='Welcome back, Olivia' subHeading=' Pick up quickly from where you left off'/>
      <Stat/>
      <Continue />
      <Competition />
    </div>
  )
}
