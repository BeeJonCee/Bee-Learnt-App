"use client";

import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

type SocialProvider = "google" | "facebook" | "apple";

type Props = {
  disabled?: boolean;
  dividerText?: string;
};

const providers: {
  id: SocialProvider;
  label: string;
  Icon: typeof GoogleIcon;
  sx?: object;
}[] = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon },
  {
    id: "apple",
    label: "Apple",
    Icon: AppleIcon,
    sx: {
      backgroundColor: "rgba(0,0,0,0.8)",
      color: "#fff",
      borderColor: "rgba(255,255,255,0.2)",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.9)",
        borderColor: "rgba(255,255,255,0.3)",
      },
    },
  },
];

export default function SocialLoginButtons({
  disabled = false,
  dividerText = "or continue with",
}: Props) {
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  const handleClick = (provider: SocialProvider) => {
    setLoading(provider);
    socialLogin(provider);
  };

  return (
    <>
      <Divider>
        <Typography variant="body2" color="text.secondary">
          {dividerText}
        </Typography>
      </Divider>
      <Stack spacing={1.5}>
        {providers.map(({ id, label, Icon, sx }) => (
          <Button
            key={id}
            variant="outlined"
            startIcon={<Icon />}
            onClick={() => handleClick(id)}
            disabled={disabled || loading !== null}
            fullWidth
            sx={{ textTransform: "none", ...sx }}
          >
            {loading === id ? "Redirecting..." : `Sign in with ${label}`}
          </Button>
        ))}
      </Stack>
    </>
  );
}
