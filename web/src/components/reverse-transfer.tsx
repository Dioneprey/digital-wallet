"use client";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { Transaction } from "@/services/transactions/type";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

import { Input } from "./ui/input";
import { formatCurrency } from "@/common/util/format-currency";
import { useActionState, useEffect, useState } from "react";
import { reverseTransfer } from "@/actions/transaction";
import { FormErrors } from "@/common/interfaces/form-response.interface";
import { useFormStatus } from "react-dom";

interface ReverseTransferProps {
  transaction: Transaction;
}

export function ReverseTransfer({ transaction }: ReverseTransferProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [actionState, formAction] = useActionState(reverseTransfer, {
    errors: null,
    success: false,
  });

  useEffect(() => {
    if (actionState.success) {
      toast.success(
        "A reversão da transferência foi solicitada e será processada em breve."
      );
      setDialogOpen(false);
    } else if (actionState.errors) {
      if (actionState.errors?.response) {
        toast.error(
          "Houve um erro ao realizar pedido de reversão de tranferência"
        );
      }

      setErrors(actionState.errors);
    }
  }, [actionState]);

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          action={(formData) => {
            formData.append("transactionId", transaction.id);
            formAction(formData);
          }}
          className="space-y-4"
        >
          <DialogHeader>
            <DialogTitle>Reverter Transferência</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reverter esta transferência de{" "}
              {formatCurrency(Math.abs(transaction.amount))}? Esta ação não
              poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <Input
            id="reason"
            name="reason"
            placeholder="Informe o motivo da reversão..."
            label="Motivo da reversão"
            error={errors}
            defaultValue={actionState.payload?.reason as string}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <SubmitButton transactionId={transaction.id} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ transactionId }: { transactionId: string }) {
  const status = useFormStatus();

  return (
    <Button disabled={!transactionId || status.pending} type="submit">
      {status.pending ? <LoaderCircle className="animate-spin" /> : "Continuar"}
    </Button>
  );
}
