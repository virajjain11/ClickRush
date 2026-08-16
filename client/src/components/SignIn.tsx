import { useForm } from "@tanstack/react-form";
import { Link } from "react-router";
import { useSignInMutation } from "../hooks/useSignInMutation";
import { signInSchema } from "../schemas/auth";
import { getErrorMessage } from "../utils/formError";
import styles from "./Auth.module.css";
import GoogleSignInButton from "./GoogleSignInButton";

export default function SignIn() {
  const signInMutation = useSignInMutation();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync(value);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Enter your credentials to continue.</p>

        <div className={styles.form}>
          <GoogleSignInButton text="signin_with" />

          <form
            className={styles.fields}
            onSubmit={(event) => {
              event.preventDefault();
              form.handleSubmit();
            }}
          >
          <form.Field name="email">
            {(field) => {
              const showErrors =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;

              return (
                <div>
                  <label htmlFor={field.name} className={styles.label}>
                    Email
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={showErrors}
                    className={
                      showErrors
                        ? `${styles.input} ${styles.inputInvalid}`
                        : styles.input
                    }
                    placeholder="you@example.com"
                  />
                  {showErrors && (
                    <p className={styles.error}>
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const showErrors =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;

              return (
                <div>
                  <label htmlFor={field.name} className={styles.label}>
                    Password
                  </label>
                  <input
                    id={field.name}
                    name={field.name}
                    type="password"
                    autoComplete="current-password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={showErrors}
                    className={
                      showErrors
                        ? `${styles.input} ${styles.inputInvalid}`
                        : styles.input
                    }
                    placeholder="••••••••"
                  />
                  {showErrors && (
                    <p className={styles.error}>
                      {getErrorMessage(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className={styles.submit}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            )}
          </form.Subscribe>

          {signInMutation.isError && (
            <p className={styles.error} role="alert">
              {signInMutation.error.message}
            </p>
          )}

          <div className={styles.footerGroup}>
            <p className={styles.footer}>
              <Link to="/forgot-password" className={styles.footerLink}>
                Forgot password?
              </Link>
            </p>
            <p className={styles.footer}>
              Don't have an account?{" "}
              <Link to="/sign-up" className={styles.footerLink}>
                Sign up
              </Link>
            </p>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
