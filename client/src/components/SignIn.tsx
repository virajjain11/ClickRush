import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import styles from "./SignIn.module.css";

const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return undefined;
}

export default function SignIn() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: signInSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Enter your credentials to continue.</p>

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
                disabled={!canSubmit}
                className={styles.submit}
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
