import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export function PriceModule() {
    const pricingOptions = [
        { unit: 'SESSION', label: 'Por Sesión', price: 25 },
        { unit: 'MONTH', label: 'Mensual', price: 200 },
        { unit: 'TRIMESTER', label: 'Trimestral', price: 550 },
        { unit: 'YEAR', label: 'Anual', price: 2000 },
    ];

    return (
        <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {pricingOptions.map((opt) => (
                <Card key={opt.unit} className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <CardHeader className="flex flex-col items-center">
                        <Badge variant="secondary" className="bg-white/20 text-white mb-2">
                            {opt.unit}
                        </Badge>
                        <CardTitle className="text-2xl font-bold">€{opt.price.toFixed(2)}</CardTitle>
                        <CardDescription className="text-sm opacity-90">{opt.label}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-xs">Incluye acceso a todos los recursos del curso</p>
                    </CardContent>
                </Card>
            ))}
        </motion.div>
    );
}
