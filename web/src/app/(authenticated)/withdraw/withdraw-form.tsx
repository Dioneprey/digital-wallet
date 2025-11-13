"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { DollarSign, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { createWithdraw } from "./actions/withdraw";
import { useFormStatus } from "react-dom";
import { FormErrors } from "@/common/interfaces/form-response.interface";
import { AmountInput } from "@/components/amount-input";
import { formatCurrency } from "@/common/util/format-currency";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WithdrawFormProps {
  balance?: number;
}

export function WithdrawForm({ balance }: WithdrawFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});

  const [actionState, formAction] = useActionState(createWithdraw, {
    errors: null,
    success: false,
  });

  useEffect(() => {
    if (actionState.success) {
      toast.success("Pedido de saque realizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["balance"] });

      router.push("/wallet");
    } else if (actionState.errors) {
      toast.error("Houve um erro ao realizar pedido de saque");

      setErrors(actionState.errors);
    }
  }, [actionState]);

  return (
    <form action={formAction}>
      <div className="space-y-2">
        <div className="relative">
          <AmountInput
            id="amount"
            icon={<DollarSign />}
            name="amount"
            label={"Valor do saque (R$)"}
            placeholder="0.00"
            step="0.01"
            error={errors}
            min={100}
            max={balance}
            defaultValue={actionState.payload?.get("amount") as string}
            onChangeFormatted={(amount) => {
              if (!isNaN(amount)) {
                setAmount(amount);
              } else {
                setAmount(0);
              }

              if (errors) {
                setErrors(null);
              }
            }}
          />
          <p
            className={cn(
              "text-xs text-muted-foreground",
              errors && errors?.amount && "pt-3"
            )}
          >
            Valor mínimo: R$ 1,00
          </p>
        </div>

        <Textarea
          id="description"
          name="description"
          placeholder="Adicione uma nota sobre este saque"
          label={`Descrição (opcional)`}
          rows={3}
          defaultValue={actionState.payload?.get("description") as string}
          error={errors}
          onChange={() => {
            if (errors) {
              setErrors(null);
            }
          }}
        />

        {amount > 0 && balance !== undefined && (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-success-foreground mb-1">
              Novo saldo após saque
            </p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(balance - Math.round(amount * 100))}
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Link href="/wallet" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            Cancelar
          </Button>
        </Link>
        <SubmitButton balance={balance} />
      </div>
    </form>
  );
}

function SubmitButton({ balance }: WithdrawFormProps) {
  const status = useFormStatus();

  return (
    <Button
      disabled={balance === undefined || status.pending}
      className="flex-1"
      type="submit"
    >
      {status.pending ? <LoaderCircle className="animate-spin" /> : "Continuar"}
    </Button>
  );
}
