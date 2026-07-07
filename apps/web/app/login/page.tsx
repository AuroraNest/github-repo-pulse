import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { getDictionary } from "../../lib/locale";

export default async function LoginPage() {
  const { t } = await getDictionary();

  return (
    <Suspense fallback={null}>
      <LoginForm labels={t.login} />
    </Suspense>
  );
}
