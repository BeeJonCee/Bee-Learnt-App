"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT" as "STUDENT" | "PARENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      // Success - redirect will happen automatically through AuthProvider
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Your Account
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Join BeeLearnt to access personalized learning materials
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <TextField
          fullWidth
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          margin="normal"
          autoFocus
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          margin="normal"
          autoComplete="email"
        />

        {/* Password */}
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          margin="normal"
          helperText="Minimum 6 characters"
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
          margin="normal"
        />

        {/* Role Selection */}
        <FormControl component="fieldset" sx={{ mt: 3, mb: 2 }}>
          <FormLabel component="legend">I am a...</FormLabel>
          <RadioGroup
            name="role"
            value={formData.role}
            onChange={(e) =>
              setFormData({
                ...formData,
                role: e.target.value as "STUDENT" | "PARENT",
              })
            }
          >
            <FormControlLabel
              value="STUDENT"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Student
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    I'm here to learn and access study materials
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="PARENT"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Parent/Guardian
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    I want to monitor my child's learning progress
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2, mb: 2 }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Additional Info */}
        <Typography variant="body2" color="text.secondary" align="center">
          By registering, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    </Paper>
  );
}
