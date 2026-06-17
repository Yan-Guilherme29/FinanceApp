import { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useStore from '../store/useStore';
import { getBudgets, setBudget, deleteBudget, getExpensesByCategory, getCustomCategories, getWeekLabel } from '../database/database';

const COLORS = {
    primary: '#6C63FF',
    income: '#4CAF50',
    expense: '#FF5252',
    warning: '#FFC107',
    background: '#0F0F1A',
    card: '#1A1A2E',
    cardBorder: '#2A2A4A',
    text: '#FFFFFF',
    textSecondary: '#9999BB',
    inputBg: '#16162A',
};

const DEFAULT_CATEGORIES = [
    { name: 'Mercado', emoji: '🛒' },
    { name: 'Alimentação', emoji: '🍔' },
    { name: 'Transporte', emoji: '🚌' },
    { name: 'Moradia', emoji: '🏠' },
    { name: 'Saúde', emoji: '💊' },
    { name: 'Lazer', emoji: '🎉' },
    { name: 'Roupas', emoji: '👗' },
    { name: 'Tecnologia', emoji: '📱' },
    { name: 'Viagem', emoji: '✈️' },
    { name: 'Outros', emoji: '📦' },
];

export default function BudgetScreen() {
    const { currentWeekStart, currency, prevWeek, nextWeek } = useStore();
    const [budgets, setBudgetsState] = useState({});
    const [spentByCategory, setSpentByCategory] = useState({});
    const [allCategories, setAllCategories] = useState(DEFAULT_CATEGORIES);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [budgetValue, setBudgetValue] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentWeekStart])
    );

    const loadData = async () => {
        const [b, spent, custom] = await Promise.all([
            getBudgets(),
            getExpensesByCategory(currentWeekStart),
            getCustomCategories(),
        ]);
        setBudgetsState(b);
        const spentMap = {};
        spent.forEach(s => { spentMap[s.category] = s.total; });
        setSpentByCategory(spentMap);
        const customCats = custom.expense.map(c => ({ name: c.name, emoji: c.emoji }));
        setAllCategories([...DEFAULT_CATEGORIES, ...customCats]);
    };

    const openModal = (category) => {
        setSelectedCategory(category);
        setBudgetValue(budgets[category.name] ? String(budgets[category.name]) : '');
        setModalVisible(true);
    };

    const handleSaveBudget = async () => {
        const value = parseFloat(budgetValue);
        if (!budgetValue || isNaN(value) || value <= 0) {
            Alert.alert('Atenção', 'Digite um valor válido.');
            return;
        }
        await setBudget(selectedCategory.name, value);
        await loadData();
        setModalVisible(false);
    };

    const handleDeleteBudget = async (categoryName) => {
        Alert.alert(
            'Remover orçamento',
            `Quer remover o orçamento de "${categoryName}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Remover', style: 'destructive', onPress: async () => { await deleteBudget(categoryName); await loadData(); } },
            ]
        );
    };

    const withBudget = allCategories.filter(c => budgets[c.name] !== undefined);
    const withoutBudget = allCategories.filter(c => budgets[c.name] === undefined);

    const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
    const totalSpent = withBudget.reduce((s, c) => s + (spentByCategory[c.name] || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    const isCurrentWeek = () => {
        const now = new Date();
        const nowDay = now.getDay();
        const diff = nowDay === 0 ? -6 : 1 - nowDay;
        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() + diff);
        currentMonday.setHours(0, 0, 0, 0);
        return new Date(currentWeekStart).toDateString() === currentMonday.toDateString();
    };

    const renderBudgetItem = (cat) => {
        const budget = budgets[cat.name] || 0;
        const spent = spentByCategory[cat.name] || 0;
        const remaining = budget - spent;
        const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
        const isOver = spent > budget;
        const isWarning = !isOver && progress >= 80;
        const barColor = isOver ? COLORS.expense : isWarning ? COLORS.warning : COLORS.primary;

        return (
            <View key={cat.name} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                    <View style={styles.budgetLeft}>
                        <Text style={styles.budgetEmoji}>{cat.emoji}</Text>
                        <View>
                            <Text style={styles.budgetName}>{cat.name}</Text>
                            <Text style={styles.budgetSub}>
                                {currency} {spent.toFixed(2)} / {currency} {budget.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.budgetRight}>
                        <Text style={[styles.budgetRemaining, { color: isOver ? COLORS.expense : COLORS.income }]}>
                            {isOver ? '-' : ''}{currency} {Math.abs(remaining).toFixed(2)}
                        </Text>
                        <Text style={styles.budgetRemainingLabel}>{isOver ? 'excedido' : 'restante'}</Text>
                    </View>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: barColor }]} />
                </View>
                {isOver && <Text style={styles.alertText}>🚨 Excedido em {currency} {Math.abs(remaining).toFixed(2)}</Text>}
                {isWarning && <Text style={[styles.alertText, { color: COLORS.warning }]}>⚠️ {progress.toFixed(0)}% do orçamento usado</Text>}
                <View style={styles.budgetActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openModal(cat)}>
                        <Ionicons name="pencil-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.editBtnText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeBtn} onPress={() => handleDeleteBudget(cat.name)}>
                        <Ionicons name="trash-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.removeBtnText}>Remover</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>💼 Orçamento</Text>
                </View>

                {/* Navegação de semana */}
                <View style={styles.weekNav}>
                    <TouchableOpacity onPress={prevWeek} style={styles.weekBtn}>
                        <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.weekText}>{getWeekLabel(currentWeekStart)}</Text>
                    <TouchableOpacity
                        onPress={nextWeek}
                        style={[styles.weekBtn, isCurrentWeek() && { opacity: 0.3 }]}
                        disabled={isCurrentWeek()}
                    >
                        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Resumo */}
                {withBudget.length > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Orçado</Text>
                                <Text style={styles.summaryValue}>{currency} {totalBudget.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Gasto</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.expense }]}>{currency} {totalSpent.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Disponível</Text>
                                <Text style={[styles.summaryValue, { color: totalRemaining >= 0 ? COLORS.income : COLORS.expense }]}>
                                    {currency} {totalRemaining.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {withBudget.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Orçamentos ativos</Text>
                        {withBudget.map(renderBudgetItem)}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {withBudget.length === 0 ? 'Defina orçamentos por categoria' : 'Adicionar orçamento'}
                    </Text>
                    {withBudget.length === 0 && (
                        <Text style={styles.emptyHint}>
                            Toque em uma categoria para definir quanto pode gastar nela por semana.
                        </Text>
                    )}
                    <View style={styles.categoriesGrid}>
                        {withoutBudget.map(cat => (
                            <TouchableOpacity key={cat.name} style={styles.categoryChip} onPress={() => openModal(cat)}>
                                <Text style={styles.categoryChipText}>{cat.emoji} {cat.name}</Text>
                                <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{selectedCategory?.emoji} {selectedCategory?.name}</Text>
                        <Text style={styles.modalSubtitle}>Quanto pode gastar por semana?</Text>
                        <View style={styles.modalCurrencyRow}>
                            <Text style={styles.modalCurrency}>{currency}</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="decimal-pad"
                                value={budgetValue}
                                onChangeText={setBudgetValue}
                                autoFocus
                            />
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveBudget}>
                                <Text style={styles.modalSaveText}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 8 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    weekNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12, gap: 12 },
    weekBtn: { padding: 8, backgroundColor: COLORS.card, borderRadius: 8 },
    weekText: { fontSize: 14, fontWeight: '600', color: COLORS.text, textAlign: 'center', flex: 1 },
    summaryCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { width: 1, height: 36, backgroundColor: COLORS.cardBorder },
    summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
    summaryValue: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
    section: { marginTop: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
    emptyHint: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 20 },
    budgetItem: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    budgetEmoji: { fontSize: 28 },
    budgetName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    budgetSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    budgetRight: { alignItems: 'flex-end' },
    budgetRemaining: { fontSize: 18, fontWeight: 'bold' },
    budgetRemainingLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    progressBar: { height: 8, backgroundColor: '#2A2A4A', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 4 },
    alertText: { fontSize: 12, color: COLORS.expense, marginBottom: 8 },
    budgetActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1E1E3A', borderWidth: 1, borderColor: COLORS.primary },
    editBtnText: { fontSize: 12, color: COLORS.primary },
    removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: COLORS.inputBg },
    removeBtnText: { fontSize: 12, color: COLORS.textSecondary },
    categoriesGrid: { gap: 8 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    categoryChipText: { fontSize: 15, color: COLORS.text },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    modalSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },
    modalCurrencyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 24, paddingLeft: 16 },
    modalCurrency: { fontSize: 18, fontWeight: 'bold', color: COLORS.textSecondary, marginRight: 8 },
    modalInput: { flex: 1, padding: 16, color: COLORS.text, fontSize: 24, fontWeight: 'bold' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center' },
    modalCancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
    modalSaveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
    modalSaveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});