import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";

const Form: React.FC = () => {
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      details: "",
      images: [] as File[],
    },
  });

  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data);
    setOpenSnackbar(true);

    // Delay navigation slightly to allow Snackbar to be seen
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px", background: "white", marginTop: "5em", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "8px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", textAlign: "center" }}>Report an Issue</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>What is your name?</label>
          <input {...register("name", { required: true })} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>What is an email address that we can reach you at? (Optional)</label>
          <input {...register("email")} type="email" style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>What is a phone number that we can reach you at? (Optional)</label>
          <input {...register("phone")} type="tel" style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>Are there any other details that you could provide? (Optional)</label>
          <textarea {...register("details")} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "80px" }}></textarea>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "500" }}>Are there any images that you would like to attach? (Optional)</label>
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <input type="file" multiple onChange={(e) => field.onChange(e.target.files)} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            )}
          />
        </div>
        <button type="submit" style={{ width: "100%", background: "#007bff", color: "white", padding: "10px", borderRadius: "4px", border: "none", cursor: "pointer", transition: "background 0.3s ease" }}>Submit</button>
      </form>

      <Snackbar open={openSnackbar} autoHideDuration={20000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>
          Thank you for submitting! If you have any other issues, please contact 1 800 XXX XXXX. 
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Form;
