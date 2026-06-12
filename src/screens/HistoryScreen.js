import { useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, Alert, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function HistoryScreen() {
    const { transactions, currency, loadData, deleteTransaction } = useStore();

    useEffect(() => { loadData(); }, []);

    const handleDelete = (id, amount, type) => {
        Alert.alert(
            'Excluir lançamento',
            `Tem certeza que quer excluir esse ${type === 'income' ? 'ganho' : 'gasto'} de ${amount}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: () => deleteTransaction(id) },
            ]
        );
    };

    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.transactionItem}>
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
                    onPress={() => handleDelete(item.id, `${item.currency} ${item.amount.toFixed(2)}`, item.type)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Histórico</Text>
                    <Text style={styles.headerSub}>{transactions.length} lançamentos</Text>
                </View>

                {transactions.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>Nenhum lançamento ainda</Text>
                        <Text style={styles.emptyHint}>Adicione seus ganhos e gastos na aba "Adicionar"</Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    headerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14 },
    typeIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    transactionInfo: { flex: 1 },
    transactionCategory: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    transactionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    transactionDate: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
    transactionRight: { alignItems: 'flex-end', gap: 6 },
    transactionAmount: { fontSize: 14, fontWeight: 'bold' },
    deleteBtn: { padding: 4 },
    separator: { height: 8 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text },
    emptyHint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
