import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import Field from "../components/Field";
import AuthLayout from "../layouts/AuthLayout";
import { login } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";

const schema = z
  .object({
    organizationName: z.string().min(2, "Enter your business name"),
    name: z.string().min(2, "Enter your name"),
    email: z.string().min(1, "Enter your email").email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(1, "Repeat your password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Values) => {
    setError("");
    try {
      await authApi.signup({ organizationName: v.organizationName, name: v.name, email: v.email, password: v.password });
      await dispatch(login({ email: v.email, password: v.password })).unwrap(); // log straight in
      navigate("/app", { replace: true });
    } catch (err) {
      setError((err as { message?: string }).message ?? "Could not create your workspace");
    }
  };

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="You will be the owner. You can invite your team afterwards."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && <p className="form-alert" role="alert">{error}</p>}
        <Field label="Business name" autoComplete="organization" placeholder="Ravi Traders" error={errors.organizationName?.message} {...register("organizationName")} />
        <Field label="Your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Field label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Field label="Password" type="password" autoComplete="new-password" hint="At least 8 characters." error={errors.password?.message} {...register("password")} />
        <Field label="Repeat password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register("confirm")} />
        <button className="btn btn--primary btn--lg btn--block" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create workspace"}</button>
      </form>
    </AuthLayout>
  );
}
