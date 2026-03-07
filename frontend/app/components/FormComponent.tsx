import React from 'react'
import { Form, useActionData } from 'react-router' 
import InputComponent from '~/components/InputComponent'
import Button from '~/components/Button'

function FormComponent({ type }: { type: string }) {

  const actionData = useActionData() as { error?: string }; 

  return (
    <Form method='post' className='p-8 flex flex-col gap-4'> 
      
      {actionData?.error && (
        <p className='text-red-500 text-sm'>{actionData.error}</p>  
      )}

      {type === 'signup' && (
        <InputComponent type='text' name='userName' placeholder='username' />
      )}
      <InputComponent type='email' name='email' placeholder='example@gmail.com' />
      <InputComponent type='password' name='password' placeholder='password' />
      <Button type='submit' label={type === 'signup' ? 'Sign Up' : 'Log In'} />
    </Form>
  )
}

export default FormComponent