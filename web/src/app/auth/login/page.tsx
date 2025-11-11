import LoginForm from "./login-form";
import { Wallet } from "lucide-react";

export default function Login() {
  return (
    <div className="flex w-screen h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-medium">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Carteira Digital
          </h1>
          <p className="text-muted-foreground">Acesse sua conta</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
