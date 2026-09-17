import { getSiteSettings } from "@/lib/settings";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const settings = await getSiteSettings();
  return <LoginForm siteName={settings.siteName} />;
}
