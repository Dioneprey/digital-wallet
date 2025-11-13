import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Wallet,
  Shield,
  Zap,
  ArrowRight,
  Lock,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden primary-gradient text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-foreground/10 mb-6 shadow-medium">
            <Wallet className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Sua carteira digital
            <br />
            simples e segura
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Gerencie seu dinheiro de forma inteligente. Faça transferências,
            depósitos e acompanhe todas as suas transações em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Criar conta gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Fazer login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Por que escolher nossa carteira?
            </h2>
            <p className="text-xl text-muted-foreground">
              Tudo que você precisa para gerenciar seu dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-success" />
                </div>
                <CardTitle>100% Seguro</CardTitle>
                <CardDescription>
                  Sua segurança é nossa prioridade. Criptografia de ponta a
                  ponta em todas as transações.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center mb-4">
                  <Zap className="h-7 w-7 text-info" />
                </div>
                <CardTitle>Transferências Rápidas</CardTitle>
                <CardDescription>
                  Envie e receba dinheiro instantaneamente. Transações
                  processadas em tempo real.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-medium hover:shadow-strong transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Controle Total</CardTitle>
                <CardDescription>
                  Acompanhe todas as suas transações com filtros avançados e
                  relatórios detalhados.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-muted-foreground">Comece em minutos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full primary-gradient text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-medium">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Crie sua conta</h3>
              <p className="text-muted-foreground">
                Cadastre-se gratuitamente em menos de 2 minutos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full primary-gradient text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-medium">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Adicione saldo</h3>
              <p className="text-muted-foreground">
                Faça seu primeiro depósito de forma segura
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full primary-gradient text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-medium">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Comece a usar</h3>
              <p className="text-muted-foreground">
                Transfira, saque e gerencie seu dinheiro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="primary-gradient text-primary-foreground shadow-strong">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Junte-se a milhares de usuários que já confiam em nossa
                plataforma
              </p>
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary">
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Carteira Digital
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2025 Carteira Digital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
