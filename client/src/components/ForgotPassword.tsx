import { useForm } from "@tanstack/react-form";
import { Link } from "react-router";
import { z } from "zod";
import { getErrorMessage } from "../utils/formError";
import styles from "./Auth.module.css";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export default function ForgotPassword() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot password</h1>
        <p className={styles.subtitle}>
          We'll email you a link to reset your password.
        </p>

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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit}
                className={styles.submit}
              >
                {isSubmitting ? "Sending…" : "Submit"}
              </button>
            )}
          </form.Subscribe>

          <p className={styles.footer}>
            <Link to="/sign-in" className={styles.footerLink}>
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
