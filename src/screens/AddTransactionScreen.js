import { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
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

const CATEGORIES_EXPENSE = [
    { label: '🛒 Mercado', value: 'Mercado' },
    { label: '🍔 Alimentação', value: 'Alimentação' },
    { label: '🚌 Transporte', value: 'Transporte' },
    { label: '🏠 Moradia', value: 'Moradia' },
    { label: '💊 Saúde', value: 'Saúde' },
    { label: '🎉 Lazer', value: 'Lazer' },
    { label: '👗 Roupas', value: 'Roupas' },
    { label: '📱 Tecnologia', value: 'Tecnologia' },
    { label: '✈️ Viagem', value: 'Viagem' },
    { label: '📦 Outros', value: 'Outros' },
];

const CATEGORIES_INCOME = [
    { label: '💼 Salário', value: 'Salário' },
    { label: '💰 Freelance', value: 'Freelance' },
    { label: '🎁 Presente', value: 'Presente' },
    { label: '📈 Investimento', value: 'Investimento' },
    { label: '📦 Outros', value: 'Outros' },
];

const CURRENCIES = ['EUR', 'USD', 'BRL', 'GBP'];

export default function AddTransactionScreen() {
    const { addTransaction, currency: defaultCurrency } = useStore();

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState(defaultCurrency);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isListening, setIsListening] = useState(false);

    const categories = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

    const handleSave = () => {
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Atenção', 'Digite um valor válido.');
            return;
        }
        if (!category) {
            Alert.alert('Atenção', 'Selecione uma categoria.');
            return;
        }

        addTransaction(type, parseFloat(amount), category, description, currency, date);

        Alert.alert('✅ Salvo!', `${type === 'income' ? 'Ganho' : 'Gasto'} de ${currency} ${amount} registrado.`);

        setAmount('');
        setCategory('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    // Entrada por voz — usa expo-speech para falar confirmação
    // e expo-av para gravar (simplificado: apenas confirma com voz)
    const handleVoiceInput = () => {
        setIsListening(true);
        // Simula escuta por 3 segundos (integração real com Speech Recognition na próxima fase)
        Speech.speak('Diga o valor e a categoria', { language: 'pt-BR' });
        setTimeout(() => {
            setIsListening(false);
            Alert.alert(
                '🎤 Entrada por voz',
                'A entrada por voz completa será ativada na próxima versão. Por enquanto, use o teclado.',
            );
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Novo lançamento</Text>
                </View>

                {/* Tipo: Gasto ou Ganho */}
                <View style={styles.typeRow}>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpenseActive]}
                        onPress={() => { setType('expense'); setCategory(''); }}
                    >
                        <Ionicons name="arrow-down-circle" size={18} color={type === 'expense' ? '#fff' : COLORS.expense} />
                        <Text style={[styles.typeBtnText, type === 'expense' && { color: '#fff' }]}>Gasto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, type === 'income' && styles.typeBtnIncomeActive]}
                        onPress={() => { setType('income'); setCategory(''); }}
                    >
                        <Ionicons name="arrow-up-circle" size={18} color={type === 'income' ? '#fff' : COLORS.income} />
                        <Text style={[styles.typeBtnText, type === 'income' && { color: '#fff' }]}>Ganho</Text>
                    </TouchableOpacity>
                </View>

                {/* Valor */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Valor</Text>
                    <View style={styles.amountRow}>
                        {/* Moeda */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
                            {CURRENCIES.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.currencyBtn, currency === c && styles.currencyBtnActive]}
                                    onPress={() => setCurrency(c)}
                                >
                                    <Text style={[styles.currencyText, currency === c && { color: '#fff' }]}>{c}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.textSecondary}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>

                {/* Categorias */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Categoria</Text>
                    <View style={styles.categoriesGrid}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat.value}
                                style={[styles.categoryBtn, category === cat.value && styles.categoryBtnActive]}
                                onPress={() => setCategory(cat.value)}
                            >
                                <Text style={[styles.categoryText, category === cat.value && { color: '#fff' }]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Descrição */}
                <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Descrição (opcional)</Text>
                        <TouchableOpacity style={styles.voiceBtn} onPress={handleVoiceInput}>
                            {isListening
                                ? <ActivityIndicator size="small" color={COLORS.primary} />
                                : <Ionicons name="mic" size={20} color={COLORS.primary} />
                            }
                            <Text style={styles.voiceBtnText}>{isListening ? 'Ouvindo...' : 'Voz'}</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        placeholder="Ex: almoço com amigos, conta de luz..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={2}
                    />
                </View>

                {/* Data */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Data</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor={COLORS.textSecondary}
                        value={date}
                        onChangeText={setDate}
                    />
                </View>

                {/* Botão salvar */}
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: type === 'expense' ? COLORS.expense : COLORS.income }]}
                    onPress={handleSave}
                >
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <Text style={styles.saveBtnText}>
                        {type === 'expense' ? 'Registrar gasto' : 'Registrar ganho'}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    typeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    typeBtnExpenseActive: { backgroundColor: COLORS.expense, borderColor: COLORS.expense },
    typeBtnIncomeActive: { backgroundColor: COLORS.income, borderColor: COLORS.income },
    typeBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '500' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    amountRow: { marginBottom: 8 },
    currencyScroll: { flexDirection: 'row' },
    currencyBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
    currencyBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    currencyText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    input: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
    inputMultiline: { height: 80, textAlignVertical: 'top' },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    categoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { fontSize: 13, color: COLORS.textSecondary },
    voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
    voiceBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 14, marginTop: 4 },
    saveBtnText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});
