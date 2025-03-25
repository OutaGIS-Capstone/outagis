import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";

const Form: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      description: "",
      cause: "",
      phone: "",
      email: "",
      name: "",
    },
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [outageData, ] = useState<any>(location.state?.outageData);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    console.log("Outage data received:", outageData);
  }, [outageData]);

  const onSubmit = async (data: any) => {

    let locationData: any;
    console.log(outageData[0]?.type);

    // Check if the location data is a Point or Polygon and format accordingly
    if (outageData[0]?.type === "Point") {
      locationData = {
        type: "Point",
        coordinates: [outageData[0].coordinates[0], outageData[0].coordinates[1]],
      };
    } else if (outageData[0]?.type === "Polygon") {
      locationData = {
        type: "Polygon",
        coordinates: [
          outageData[0].coordinates[0]
        ],
      };
      console.log(locationData);
    }

    const requestData: any = {
      location: locationData,
    };

    if (data.description) requestData.description = data.description;
    if (data.cause) requestData.cause = data.cause;
    console.log("Form submitted:", requestData);

    try {
      const response = await fetch(
        "https://xtrgtablbj.execute-api.ca-central-1.amazonaws.com/default/outagis-insert_outage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        console.error("Failed to submit outage.");
      }
    } catch (error) {
      console.error("Error submitting outage:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff, #dfe7fd)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "#fff",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} textAlign="center" mb={2}>
            Report an Issue
          </Typography>

          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <TextField
              label="Your Name"
              variant="outlined"
              fullWidth
              {...register("name", { required: true })}
            />

            <TextField
              label="Phone Number (Optional)"
              variant="outlined"
              fullWidth
              type="tel"
              {...register("phone")}
            />

            <TextField
              label="Email Address (Optional)"
              variant="outlined"
              fullWidth
              type="email"
              {...register("email")}
            />

            <Typography color="error" variant="body2">
              {errors.phone && !errors.email && "Please provide either a phone number or email."}
              {errors.email && !errors.phone && "Please provide either a phone number or email."}
            </Typography>

            <TextField
              label="Additional Details (Optional)"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              {...register("description")}
            />
            <TextField
              label="Cause of the Outage (Optional)"
              variant="outlined"
              fullWidth
              {...register("cause")}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "#007bff",
                "&:hover": { background: "#0056b3" },
                borderRadius: 2,
                py: 1.5,
                textTransform: "none",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Thank you for submitting! If you have any other issues, please contact 1 800 XXX XXXX.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Form;
