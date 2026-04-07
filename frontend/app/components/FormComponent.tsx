import React, { useEffect } from 'react'
import { Form, useActionData } from 'react-router' 
import InputComponent from '~/components/InputComponent'
import Button from '~/components/Button'
import { toast } from "sonner";

function FormComponent({ type }: { type: string }) {

  const actionData = useActionData() as { error?: string }; 

  useEffect(()=>{
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  },[actionData]);
  return (
    <Form method='post' className='p-8 flex flex-col gap-4'> 
      
      {/* {actionData?.error && (
        <p className='text-red-500 text-sm'>{actionData.error}</p>  
      )} */}

      {type === 'signup' && (
        <InputComponent type='text' name='fullname' placeholder='Full Name' className='' />
      )}
      <InputComponent type='email' name='email' placeholder='example@gmail.com' className=''/>
      <InputComponent type='password' name='password' placeholder='password' className=''/>
      <Button type='submit' label={type === 'signup' ? 'Sign Up' : 'Log In'} />
    </Form>
  )
}

export default FormComponent