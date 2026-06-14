import { useCallback, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, Alert, FlatList, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
    inputBg: '#16162A',
};

function getDateLabel(dateStr) {
    const today = new Date();
    const date = new Date(dateStr + 'T00:00:00');
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Ontem';
    if (diff <= 7) return 'Esta semana';
    if (diff <= 30) return 'Este mês';
    return 'Mais antigos';
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

export default function HistoryScreen() {
    const { transactions, loadData, deleteTransaction } = useStore();
    const [filter, setFilter] = useState('all'); // all | income | expense
    const [search, setSearch] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleDelete = (id, amount, type, currency) => {
        Alert.alert(
            'Excluir lançamento',
            `Tem certeza que quer excluir esse ${type === 'income' ? 'ganho' : 'gasto'} de ${currency} ${amount}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => deleteTransaction(id) },
            ]
        );
    };

    // Filtra e agrupa as transações
    const { grouped, total } = useMemo(() => {
        let filtered = transactions;

        if (filter !== 'all') {
            filtered = filtered.filter(t => t.type === filter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            filtered = filtered.filter(t =>
                t.category.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q))
            );
        }

        // Total do filtro atual
        const total = filtered.reduce((sum, t) => {
            return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);

        // Agrupa por label de data
        const groups = {};
        filtered.forEach(t => {
            const label = getDateLabel(t.date);
            if (!groups[label]) groups[label] = [];
            groups[label].push(t);
        });

        // Ordena os grupos
        const order = ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Mais antigos'];
        const grouped = order
            .filter(label => groups[label])
            .map(label => ({ label, data: groups[label] }));

        return { grouped, total };
    }, [transactions, filter, search]);

    const renderTransaction = (item) => (
        <View key={item.id} style={styles.transactionItem}>
            <View style={[styles.typeIcon, { backgroundColor: item.type === 'income' ? '#1A2E1A' : '#2E1A1A' }]}>
                <Ionicons
                    name={item.type === 'income' ? 'arrow-up' : 'arrow-down'}
                    size={18}
                    color={item.type === 'income' ? COLORS.income : COLORS.expense}
                />
            </View>
            <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>{item.category}</Text>
                {item.description ? (
                    <Text style={styles.transactionDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? COLORS.income : COLORS.expense }]}>
                    {item.type === 'income' ? '+' : '-'} {item.currency} {item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.amount.toFixed(2), item.type, item.currency)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        if (grouped.length === 0) {
            return (
                <View style={styles.empty}>
                    <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
                    <Text style={styles.emptyText}>
                        {search || filter !== 'all' ? 'Nenhum resultado encontrado' : 'Nenhum lançamento ainda'}
                    </Text>
                    <Text style={styles.emptyHint}>
                        {search || filter !== 'all' ? 'Tente mudar os filtros' : 'Adicione seus ganhos e gastos na aba "Adicionar"'}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={grouped}
                keyExtractor={(item) => item.label}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item: group }) => (
                    <View style={styles.group}>
                        <Text style={styles.groupLabel}>{group.label}</Text>
                        {group.data.map(renderTransaction)}
                    </View>
                )}
            />
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Histórico</Text>
                    <View style={[styles.totalBadge, { backgroundColor: total >= 0 ? '#1A2E1A' : '#2E1A1A' }]}>
                        <Text style={[styles.totalText, { color: total >= 0 ? COLORS.income : COLORS.expense }]}>
                            {total >= 0 ? '+' : ''}{total.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Busca */}
                <View style={styles.searchRow}>
                    <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por categoria ou descrição..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search ? (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Filtros */}
                <View style={styles.filterRow}>
                    {[
                        { key: 'all', label: 'Todos' },
                        { key: 'income', label: '↑ Ganhos' },
                        { key: 'expense', label: '↓ Gastos' },
                    ].map(f => (
                        <TouchableOpacity
                            key={f.key}
                            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Lista agrupada */}
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    totalBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    totalText: { fontSize: 14, fontWeight: 'bold' },
    searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
    filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    filterTextActive: { color: '#fff' },
    group: { marginBottom: 16 },
    groupLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, marginBottom: 8 },
    typeIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    transactionInfo: { flex: 1 },
    transactionCategory: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    transactionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    transactionDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
    transactionRight: { alignItems: 'flex-end', gap: 6 },
    transactionAmount: { fontSize: 14, fontWeight: 'bold' },
    deleteBtn: { padding: 4 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    emptyHint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});