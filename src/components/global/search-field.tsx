import { InputField } from '../custom/custom-form-field'
import { Search } from 'lucide-react'

interface SearchFieldProps {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
}

export default function SearchField({ value, onChange, placeholder = 'search' }: SearchFieldProps) {
    return (
        <InputField
            containerClassName=' relative max-w-80 space-y-0 '
            className='rounded-md border-2 h-12 my-auto pl-10'
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            icon={<Search
                className=' absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 h-5'
            />} />

    )
}
