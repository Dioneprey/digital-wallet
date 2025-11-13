"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { LoaderCircle, Lock, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { registerUser } from "../actions/auth";
import { useRouter } from "next/navigation";
import { FormErrors } from "@/common/interfaces/form-response.interface";

export default function SignupForm() {
  const router = useRouter();

  const [state, formAction] = useActionState(registerUser, {
    errors: null,
    success: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (state.success) {
      router.push("/wallet");
    } else if (state.errors) {
      setErrors(state.errors);
    }
  }, [state]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro</CardTitle>
        <CardDescription>
          Preencha os dados para criar sua conta
        </CardDescription>
      </CardHeader>
      <form action={formAction} className="w-full space-y-4">
        <CardContent className="space-y-4">
          <Input
            error={errors}
            id="name"
            name="name"
            label="Nome"
            type="text"
            icon={<Mail size={20} />}
            placeholder="Nome"
            onChange={handleInputChange}
          />
          <Input
            error={errors}
            name="email"
            label="E-mail"
            type="email"
            icon={<Mail size={20} />}
            placeholder="E-mail"
            onChange={handleInputChange}
          />
          <Input
            error={errors}
            id="password"
            name="password"
            label="Senha"
            type="password"
            icon={<Lock size={20} />}
            placeholder="Senha"
            onChange={handleInputChange}
          />
          <Input
            error={errors}
            id="password_confirm"
            name="password_confirm"
            label="Confirmar senha"
            type="password"
            icon={<Lock size={20} />}
            placeholder="Confirmar senha"
            onChange={handleInputChange}
          />
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aceito os{" "}
              <Link href="" className="text-primary hover:underline">
                termos de uso
              </Link>
            </label>
          </div>
          <SubmitButton />
        </CardContent>
      </form>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            Fazer login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function SubmitButton() {
  const status = useFormStatus();

  return (
    <Button disabled={status.pending} className="w-full" type="submit">
      {status.pending ? <LoaderCircle className="animate-spin" /> : "Continuar"}
    </Button>
  );
}
