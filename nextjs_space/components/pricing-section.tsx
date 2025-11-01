
'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Guest",
    icon: Zap,
    price: "Free",
    period: "No signup required",
    description: "Perfect for occasional use",
    badge: null,
    features: [
      { text: "All PDF operations", included: true },
      { text: "Max file size: 10MB", included: true },
      { text: "Temporary file storage", included: true },
      { text: "Basic processing speed", included: true },
      { text: "Watermark on outputs", included: false },
      { text: "Cloud storage", included: false },
      { text: "File history", included: false },
      { text: "Priority support", included: false }
    ],
    cta: "Try Now",
    href: "/#",
    popular: false
  },
  {
    name: "Premium",
    icon: Crown,
    price: "$9.99",
    period: "per month",
    description: "For professionals and businesses",
    badge: "Most Popular",
    features: [
      { text: "All PDF operations", included: true },
      { text: "Max file size: 1GB", included: true },
      { text: "Cloud storage & sync", included: true },
      { text: "Lightning fast processing", included: true },
      { text: "No watermarks", included: true },
      { text: "Complete file history", included: true },
      { text: "Bulk operations", included: true },
      { text: "Priority support", included: true }
    ],
    cta: "Start Free Trial",
    href: "/auth/signup",
    popular: true
  }
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start free, upgrade when you're ready for more power.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-green-500 text-xs">
                Save 20%
              </Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-blue-500/50 shadow-xl shadow-blue-500/10'
                  : 'border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-blue-600' : 'bg-slate-700'
                    }`}>
                      <plan.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.name === 'Premium' && billingPeriod === 'yearly' ? '$7.99' : plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-400">
                        /{billingPeriod === 'yearly' && plan.name === 'Premium' ? 'month (billed yearly)' : plan.period}
                      </span>
                    )}
                  </div>
                  {plan.name === 'Premium' && billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-400 mt-1">Save $24/year</p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-slate-200' : 'text-slate-500'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-white mb-2">Is my data secure?</h4>
                <p className="text-slate-400 text-sm">
                  Yes, we use bank-grade encryption and automatically delete files after processing. 
                  Guest files are removed immediately after your session ends.
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-white mb-2">Can I cancel anytime?</h4>
                <p className="text-slate-400 text-sm">
                  Absolutely! Cancel your subscription at any time with no questions asked. 
                  You'll continue to have access until the end of your billing period.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-white mb-2">What file formats are supported?</h4>
                <p className="text-slate-400 text-sm">
                  We support PDF, Word (DOCX), Excel (XLSX), PowerPoint (PPTX), 
                  and most common image formats (PNG, JPG, GIF, BMP).
                </p>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-6 text-left">
                <h4 className="font-semibold text-white mb-2">Is there a free trial?</h4>
                <p className="text-slate-400 text-sm">
                  Yes! You can try all features for free without signing up. 
                  Premium users get larger files, cloud storage, and no watermarks.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
