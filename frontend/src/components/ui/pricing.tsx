"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

export interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you.\nAll plans include access to our platform, logging tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "#7c3aed",
          "#db2777",
          "#2563eb",
          "#4b5563",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="flex justify-center items-center gap-2 mb-10">
        <Switch
          ref={switchRef}
          checked={!isMonthly}
          onCheckedChange={handleToggle}
          id="billing-switch"
        />
        <Label htmlFor="billing-switch" className="font-semibold text-foreground cursor-pointer select-none">
          Annual billing <span className="text-primary">(Save 20%)</span>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                    x: index === 2 ? -15 : index === 0 ? 15 : 0,
                    scale: index === 0 || index === 2 ? 0.96 : 1.0,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.2,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.2,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              "rounded-2xl border-[1px] p-6 bg-background text-center flex flex-col relative",
              plan.isPopular ? "border-primary border-2 shadow-lg" : "border-border shadow-sm",
              !plan.isPopular && "mt-5",
              index === 0 || index === 2 ? "z-0" : "z-10"
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-1 px-3 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                <Star className="text-white h-3.5 w-3.5 fill-current" />
                <span className="text-white text-xs font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-lg font-bold text-muted-foreground uppercase tracking-wider">
                  {plan.name}
                </p>
                <div className="mt-6 flex items-center justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    <NumberFlow
                      value={
                        isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                      }
                      format={{
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      formatter={(value) => `$${value}`}
                      transformTiming={{
                        duration: 500,
                        easing: "ease-out",
                      }}
                      willChange
                      className="font-variant-numeric: tabular-nums"
                    />
                  </span>
                  {plan.period !== "Next 3 months" && (
                    <span className="text-sm font-semibold leading-6 tracking-wide text-muted-foreground">
                      / {plan.period}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-5 text-muted-foreground mt-1">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>

                <ul className="mt-8 gap-3 flex flex-col">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-left leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <hr className="w-full my-4 border-border" />

                <Link
                  to={plan.href}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                    }),
                    "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter rounded-xl py-6",
                    "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-white",
                    plan.isPopular
                      ? "bg-primary text-white border-transparent"
                      : "bg-background text-foreground border-border"
                  )}
                >
                  {plan.buttonText}
                </Link>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
