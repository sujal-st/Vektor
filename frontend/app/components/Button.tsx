import React from 'react'

type proptype={
  type:"submit"|"button"|"reset";
  label:string;
}
function Button({type,label}:proptype) {
  return (
    <button type={type} className='btn-primary disabled:opacity-50 disabled:cursor-not-allowed'>
      {label}
    </button>
  )
}

export default Button
