"use client"

import React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, ExternalLink, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface FaqItem {
  id: string
  question: string
  answer: string
  category?: string
  order?: number
  isActive?: boolean
  courseId?: string | null
}

interface FaqAccordionProps {
  faqs?: FaqItem[]
  title?: string
  subtitle?: string
  className?: string
  groupByCategory?: boolean
}

export function FaqAccordion({
  faqs = [],
  title = "Preguntas frecuentes",
  subtitle = "Resolvemos las dudas más habituales sobre este curso.",
  className = "",
  groupByCategory = true
}: FaqAccordionProps) {
  // Filtrar solo las activas
  const activeFaqs = faqs.filter(f => f.isActive !== false)

  if (!activeFaqs || activeFaqs.length === 0) {
    return null
  }

  // Agrupar por categoría si se indica
  const categories = Array.from(new Set(activeFaqs.map(f => f.category?.trim() || "General")))

  return (
    <Card className={`border-none shadow-sm rounded-2xl bg-white overflow-hidden border border-slate-100/80 ${className}`}>
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="h-4 w-4 text-red-600" />
            <span>{title}</span>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold text-slate-500 bg-white border-slate-200 w-fit">
            {activeFaqs.length} {activeFaqs.length === 1 ? 'duda resuelta' : 'dudas resueltas'}
          </Badge>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 font-normal">
            {subtitle}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {groupByCategory && categories.length > 1 ? (
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryFaqs = activeFaqs.filter(f => (f.category?.trim() || "General") === category)
              if (categoryFaqs.length === 0) return null

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {category}
                    </h4>
                  </div>
                  <Accordion type="multiple" className="w-full space-y-2">
                    {categoryFaqs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="border border-slate-100 rounded-xl px-4 py-1 data-[state=open]:bg-slate-50/50 transition-colors"
                      >
                        <AccordionTrigger className="text-left font-semibold text-xs sm:text-sm text-slate-800 hover:text-red-700 hover:no-underline py-3">
                          <span>{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-1 pb-3 prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                                >
                                  <span>{props.children}</span>
                                  <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              ),
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />
                            }}
                          >
                            {faq.answer}
                          </ReactMarkdown>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            })}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {activeFaqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-slate-100 rounded-xl px-4 py-1 data-[state=open]:bg-slate-50/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-xs sm:text-sm text-slate-800 hover:text-red-700 hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    {faq.category && (
                      <Badge variant="secondary" className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5">
                        {faq.category}
                      </Badge>
                    )}
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-xs sm:text-sm leading-relaxed pt-1 pb-3 prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                        >
                          <span>{props.children}</span>
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      ),
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-slate-900" {...props} />
                    }}
                  >
                    {faq.answer}
                  </ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
