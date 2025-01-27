import { useForm, SubmitHandler } from "react-hook-form"

import './InputForm.css';

// Sources for regex expressions used in form validation:
// Phone numbers: https://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number
// Email addresses: https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression

type Inputs = {
  userName: string
  userPhone: string
  userEmail: string
  additionalInfo: string
}

function InputForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
	  <label>Please enter the following information:</label>
	  <label>Your name</label>
      <input {...register("userName", { required: true })} />
      {errors.userName && <span>This field is required</span>}

	  <label>A phone number that we can use to reach you</label>
      <input {...register("userPhone", { required: true, pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/ })} />
	  {errors.userPhone && <span>Please enter a valid phone number</span>}

	  <label>An email address that we can use to reach you (optional)</label>
      <input defaultValue="" {...register("userEmail", {pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/ })} />
	  {errors.userEmail && <span>Please enter a valid email address</span>}

	  <label>Any additional details about the outage (optional)</label>
      <input defaultValue="" {...register("additionalInfo", {maxLength: 250})} />

      <input type="submit" />
    </form>
  )
};

export default InputForm;
