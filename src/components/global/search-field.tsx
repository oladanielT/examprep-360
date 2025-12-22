import React from 'react'
import { InputField } from '../custom/custom-form-field'
import { Search } from 'lucide-react'

export default function SearchField() {
    return (
        <InputField
            containerClassName=' relative max-w-80 space-y-0 '
            className='rounded-md border-2 h-12 my-auto pl-10'
            placeholder='search'
            icon={<Search
                className=' absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 h-5'
            />} />

    )
}
