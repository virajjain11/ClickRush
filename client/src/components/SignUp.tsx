import { useForm } from "@tanstack/react-form";
import { Link } from "react-router";
import { z } from "zod";
import { getErrorMessage } from "../utils/formError";
import styles from "./Auth.module.css";

const signUpSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export default function SignUp() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.subtitle}>Create an account to get started.</p>

        <form
          className={styles.form}
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
                    autoComplete="new-password"
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
                disabled={!canSubmit}
                className={styles.submit}
              >
                {isSubmitting ? "Signing up…" : "Sign up"}
              </button>
            )}
          </form.Subscribe>

          <p className={styles.footer}>
            Already have an account?{" "}
            <Link to="/sign-in" className={styles.footerLink}>
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
