import React from "react";
import { useSearchParams } from "react-router-dom";
import ResetPasswordView from "../components/Auth/ResetPassword";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");
  return <ResetPasswordView uid={uid} token={token} />;
}
