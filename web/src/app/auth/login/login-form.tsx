"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateCredentials } from "../actions/auth";
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
import { useRouter } from "next/navigation";
import { FormErrors } from "@/common/interfaces/form-response.interface";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const [actionState, formAction] = useActionState(validateCredentials, {
    errors: null,
    success: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (actionState.success) {
      router.push("/wallet");
    } else if (actionState.errors) {
      if (actionState.errors?.response) {
        toast.error("Houve um erro ao realizar login");
      }

      setErrors(actionState.errors);
    }
  }, [actionState]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Digite suas credenciais para acessar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} className="w-full space-y-4">
          <Input
            name="email"
            label="E-mail"
            type="email"
            icon={<Mail size={20} />}
            placeholder="E-mail"
            error={errors}
            defaultValue={actionState.payload?.email as string}
            onChange={() => {
              if (errors) {
                setErrors(null);
              }
            }}
          />
          <Input
            error={errors}
            name="password"
            label="Senha"
            type="password"
            defaultValue={actionState.payload?.password as string}
            icon={<Lock size={20} />}
            placeholder="Senha"
            onChange={() => {
              if (errors) {
                setErrors(null);
              }
            }}
          />
          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-sm text-center text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:underline font-medium"
          >
            Criar conta
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
