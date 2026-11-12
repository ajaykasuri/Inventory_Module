import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth";
import Field from "../components/Field";
import AuthLayout from "../layouts/AuthLayout";

const schema = z
  .object({
    name: z.string().min(2, "Enter your name"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(1, "Repeat your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

export default function AcceptInvitation() {
  const token = useSearchParams()[0].get("token");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <AuthLayout title="This invitation link is incomplete" subtitle="Ask the person who invited you to send the link again." footer={<Link to="/login">Go to log in</Link>}>
        <span />
      </AuthLayout>
    );
  }

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      const res = await authApi.acceptInvitation({ token, name: v.name, password: v.password });
      navigate("/login", { replace: true, state: { notice: "Your account is ready. Log in to continue.", email: res.email } });
    } catch (err) {
      setError((err as { message?: string }).message ?? "Could not accept the invitation");
    }
  };

  return (
    <AuthLayout title="Join your team" subtitle="Choose your name and a password to finish setting up." footer={<>Already joined? <Link to="/login">Log in</Link></>}>
      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <p className="form-alert" role="alert">{error}</p>}
        <Field label="Your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Field label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
        <Field label="Repeat password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm")} />
        <button className="btn btn--primary btn--lg btn--block" disabled={isSubmitting}>{isSubmitting ? "Joining..." : "Join team"}</button>
      </form>
    </AuthLayout>
  );
}
