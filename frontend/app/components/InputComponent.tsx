import React from 'react'

type InputPropType = {
    type: string;
    name: string;
    placeholder: string;
    className: string;
}

function InputComponent({ type, name, placeholder, className="" }: InputPropType) {
    const capitalize = (str: string) => {
        if (!str) return "";
        return str[0].toUpperCase() + str.slice(1);
    }

    return (
        <div className={`flex flex-col ${className}`}>
            <label className='font-semibold'>{capitalize(name)}</label>
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                required
                className={`border-[3px] border-white w-full rounded bg-[#FAF8F4] shadow py-[0.3rem] px-[1rem] focus:border-[#AB2320] outline-none`}
            />
        </div>
    )
}

export default InputComponent