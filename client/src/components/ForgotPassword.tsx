import { useForm } from "@tanstack/react-form";
import { Link } from "react-router";
import { useForgotPasswordMutation } from "../hooks/useForgotPasswordMutation";
import { forgotPasswordSchema } from "../schemas/auth";
import { getErrorMessage } from "../utils/formError";
import styles from "./Auth.module.css";

export default function ForgotPassword() {
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await forgotPasswordMutation.mutateAsync(value);
    },
  });

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>ClickRush</p>
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
                disabled={!canSubmit || isSubmitting}
                className={styles.submit}
              >
                {isSubmitting ? "Sending…" : "Submit"}
              </button>
            )}
          </form.Subscribe>

          {forgotPasswordMutation.isSuccess && (
            <p className={styles.success} role="status">
              {forgotPasswordMutation.data.message}
            </p>
          )}

          {forgotPasswordMutation.isError && (
            <p className={styles.error} role="alert">
              {forgotPasswordMutation.error.message}
            </p>
          )}

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
