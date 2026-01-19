import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Euro, Calendar, Clock, Layers } from 'lucide-react';

export function PriceModule() {
    const pricingOptions = [
        { unit: 'SESSION', label: 'Sesión Individual', price: 25, icon: <Clock className="h-5 w-5" />, desc: 'Pago por cada clase' },
        { unit: 'MONTH', label: 'Mensualidad', price: 200, icon: <Calendar className="h-5 w-5" />, desc: 'Suscripción mensual' },
        { unit: 'TRIMESTER', label: 'Trimestre', price: 550, icon: <Layers className="h-5 w-5" />, desc: 'Ahorro del 10% aprox.' },
        { unit: 'YEAR', label: 'Anualidad Completa', price: 2000, icon: <Euro className="h-5 w-5" />, desc: 'Mejor valor por dinero' },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
                    Estuctuas de <span className="text-blue-600">Precios</span>
                </h2>
                <p className="text-slate-500 font-medium">
                    Flexibilidad total adaptada a tus necesidades formativas. Elige el plan que mejor se ajuste a tu ritmo.
                </p>
            </div>

            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {pricingOptions.map((opt, idx) => (
                    <motion.div
                        key={opt.unit}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white h-full flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                            <CardHeader className="flex flex-col items-center pt-8">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                    {opt.icon}
                                </div>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-blue-100 text-blue-600 bg-blue-50/50 mb-2">
                                    {opt.unit}
                                </Badge>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-bold text-slate-400">€</span>
                                    <CardTitle className="text-4xl font-black text-slate-900">{opt.price}</CardTitle>
                                </div>
                                <CardDescription className="text-sm font-bold text-slate-500 mt-2">{opt.label}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center flex-1">
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {opt.desc}
                                </p>
                            </CardContent>
                            <div className="p-6 pt-0 mt-auto">
                                <div className="h-px w-full bg-slate-50 mb-4" />
                                <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-tighter">Acceso Total Garantizado</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
