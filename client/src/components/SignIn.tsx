import { useForm } from "@tanstack/react-form";
import { z } from "zod";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your credentials to continue.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => {
              const showErrors =
                field.state.meta.isTouched && field.state.meta.errors.length > 0;

              return (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-slate-700"
                  >
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
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 ${
                      showErrors
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
                    }`}
                    placeholder="you@example.com"
                  />
                  {showErrors && (
                    <p className="mt-1 text-xs text-red-600">
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
                field.state.meta.isTouched && field.state.meta.errors.length > 0;

              return (
                <div>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-slate-700"
                  >
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
                    className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 ${
                      showErrors
                        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
                    }`}
                    placeholder="••••••••"
                  />
                  {showErrors && (
                    <p className="mt-1 text-xs text-red-600">
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
                className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
