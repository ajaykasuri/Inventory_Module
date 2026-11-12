import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/Field";
import AuthLayout from "../layouts/AuthLayout";
import { login } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";

const schema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const state = useLocation().state as { from?: string; notice?: string; email?: string } | null;
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: state?.email ?? "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    setError("");
    try {
      await dispatch(login(values)).unwrap();
      navigate(state?.from ?? "/app", { replace: true });
    } catch (err) {
      setError((err as { message?: string }).message ?? "Could not log in");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your workspace."
      footer={<>New here? <Link to="/signup">Create a workspace</Link></>}
    >
      <form className="auth__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {state?.notice && <p className="form-alert form-alert--ok" role="status">{state.notice}</p>}
        {error && <p className="form-alert" role="alert">{error}</p>}
        <Field label="Email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
        <Field label="Password" type="password" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <button className="btn btn--primary btn--lg btn--block" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
      </form>
    </AuthLayout>
  );
}
