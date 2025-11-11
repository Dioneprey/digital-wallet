"use client";
import { formatCurrency } from "@/common/util/format-currency";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { DollarSign, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TransferForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const balance = 10200; // Mock balance

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipient) {
      newErrors.recipient = "Email ou ID do destinatário é obrigatório";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipient) &&
      !/^\d+$/.test(formData.recipient)
    ) {
      newErrors.recipient = "Email ou ID inválido";
    }

    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Valor inválido";
    } else if (amount > balance) {
      newErrors.amount = "Saldo insuficiente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast.success(
        `${formatCurrency(
          parseFloat(formData.amount) * 100
        )} transferido com sucesso.`
      );
      setIsLoading(false);
      router.push("/wallet");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground mb-1">Saldo atual</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              id="recipient"
              placeholder="Email ou ID do usuário"
              className="pl-10"
              icon={<User />}
              label={"Destinatário"}
              value={formData.recipient}
              onChange={(e) => {
                setFormData({ ...formData, recipient: e.target.value });
                setErrors({ ...errors, recipient: "" });
              }}
            />
          </div>
          {errors.recipient && (
            <p className="text-sm text-destructive">{errors.recipient}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              id="amount"
              type="number"
              label={"Valor do depósito (R$)"}
              icon={<DollarSign />}
              step="0.01"
              placeholder="0.00"
              className="pl-10"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
                setErrors({ ...errors, amount: "" });
              }}
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Valor mínimo: R$ 1,00 • Valor máximo: R$ 10.000,00
          </p>
        </div>

        <div className="space-y-2">
          <Textarea
            id="description"
            placeholder="Adicione uma nota sobre esta transferência"
            label={`Descrição (opcional)`}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        {formData.amount &&
          !errors.amount &&
          parseFloat(formData.amount) > 0 && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success-foreground mb-1">
                Novo saldo após essa tranferência
              </p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(balance - parseFloat(formData.amount) * 100)}
              </p>
            </div>
          )}

        <div className="flex space-x-3 pt-4">
          <Link href="/wallet" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            className="flex-1 bg-success hover:bg-success/90"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Confirmar tranferência"}
          </Button>
        </div>
      </CardContent>
    </form>
  );
}
