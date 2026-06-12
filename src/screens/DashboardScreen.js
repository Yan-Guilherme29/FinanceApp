import { useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import useStore from '../store/useStore';

const COLORS = {
    primary: '#6C63FF',
    income: '#4CAF50',
    expense: '#FF5252',
    background: '#0F0F1A',
    card: '#1A1A2E',
    cardBorder: '#2A2A4A',
    text: '#FFFFFF',
    textSecondary: '#9999BB',
};

const CATEGORY_COLORS = [
    '#6C63FF', '#FF5252', '#4CAF50', '#FFC107',
    '#00BCD4', '#FF9800', '#E91E63', '#9C27B0'
];

const MONTHS = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function DashboardScreen() {
    const {
        summary, expensesByCategory, currentYear, currentMonth,
        savingGoalPercent, currency, loadData, setMonth, getSavingTarget
    } = useStore();

    useEffect(() => { loadData(); }, []);

    const savingTarget = getSavingTarget();
    const saved = summary.balance > 0 ? Math.min(summary.balance, savingTarget) : 0;
    const savingProgress = savingTarget > 0 ? (saved / savingTarget) * 100 : 0;

    const pieData = expensesByCategory.map((item, index) => ({
        value: item.total,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        label: item.category,
    }));

    const prevMonth = () => {
        if (currentMonth === 1) setMonth(currentYear - 1, 12);
        else setMonth(currentYear, currentMonth - 1);
    };

    const nextMonth = () => {
        const now = new Date();
        if (currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1) return;
        if (currentMonth === 12) setMonth(currentYear + 1, 1);
        else setMonth(currentYear, currentMonth + 1);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>💰 FinanceApp</Text>
                    <Text style={styles.headerSub}>Olá! Aqui está seu resumo</Text>
                </View>

                {/* Navegação de mês */}
                <View style={styles.monthNav}>
                    <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>
                        {MONTHS[currentMonth - 1]} {currentYear}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Cards de resumo */}
                <View style={styles.cardsRow}>
                    <View style={[styles.card, { borderLeftColor: COLORS.income }]}>
                        <Text style={styles.cardLabel}>Ganhos</Text>
                        <Text style={[styles.cardValue, { color: COLORS.income }]}>
                            {currency} {summary.income.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.card, { borderLeftColor: COLORS.expense }]}>
                        <Text style={styles.cardLabel}>Gastos</Text>
                        <Text style={[styles.cardValue, { color: COLORS.expense }]}>
                            {currency} {summary.expense.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Saldo */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Saldo do mês</Text>
                    <Text style={[styles.balanceValue, { color: summary.balance >= 0 ? COLORS.income : COLORS.expense }]}>
                        {currency} {summary.balance.toFixed(2)}
                    </Text>
                </View>

                {/* Meta de poupança */}
                <View style={styles.savingCard}>
                    <View style={styles.savingHeader}>
                        <Text style={styles.savingTitle}>🎯 Meta de poupança ({savingGoalPercent}%)</Text>
                        <Text style={styles.savingAmount}>
                            {currency} {saved.toFixed(2)} / {currency} {savingTarget.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(savingProgress, 100)}%` }]} />
                    </View>
                    <Text style={styles.savingHint}>
                        {savingProgress >= 100
                            ? '🎉 Meta atingida esse mês!'
                            : `Faltam ${currency} ${(savingTarget - saved).toFixed(2)} para sua meta`}
                    </Text>
                </View>

                {/* Gráfico de categorias */}
                {pieData.length > 0 && (
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>Gastos por categoria</Text>
                        <View style={styles.chartContainer}>
                            <PieChart
                                data={pieData}
                                donut
                                radius={90}
                                innerRadius={55}
                                centerLabelComponent={() => (
                                    <Text style={styles.chartCenter}>Gastos</Text>
                                )}
                            />
                        </View>
                        {/* Legenda */}
                        <View style={styles.legend}>
                            {pieData.map((item, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.legendText}>{item.label}</Text>
                                    <Text style={styles.legendValue}>{currency} {item.value.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {pieData.length === 0 && (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>Nenhum gasto registrado esse mês</Text>
                        <Text style={styles.emptyHint}>Adicione seus lançamentos na aba "Adicionar"</Text>
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 8 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    headerSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16, gap: 20 },
    monthBtn: { padding: 8, backgroundColor: COLORS.card, borderRadius: 8 },
    monthText: { fontSize: 16, fontWeight: '600', color: COLORS.text, minWidth: 100, textAlign: 'center' },
    cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    card: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderLeftWidth: 3, borderColor: COLORS.cardBorder },
    cardLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
    cardValue: { fontSize: 18, fontWeight: 'bold' },
    balanceCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
    balanceLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
    balanceValue: { fontSize: 28, fontWeight: 'bold' },
    savingCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
    savingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    savingTitle: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
    savingAmount: { fontSize: 12, color: COLORS.textSecondary },
    progressBar: { height: 8, backgroundColor: '#2A2A4A', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
    savingHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8 },
    chartCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
    chartTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
    chartContainer: { alignItems: 'center', marginBottom: 16 },
    chartCenter: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
    legend: { gap: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
    legendValue: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
    emptyChart: { backgroundColor: COLORS.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
    emptyText: { fontSize: 15, color: COLORS.text, marginBottom: 6 },
    emptyHint: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
});
