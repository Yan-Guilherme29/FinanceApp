import { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, SafeAreaView, Alert,
    Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import useStore from '../store/useStore';
import { getCustomCategories, addCustomCategory } from '../database/database';

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

const DEFAULT_EXPENSE = [
    { id: 'mercado', name: 'Mercado', emoji: '🛒' },
    { id: 'alimentacao', name: 'Alimentação', emoji: '🍔' },
    { id: 'transporte', name: 'Transporte', emoji: '🚌' },
    { id: 'moradia', name: 'Moradia', emoji: '🏠' },
    { id: 'saude', name: 'Saúde', emoji: '💊' },
    { id: 'lazer', name: 'Lazer', emoji: '🎉' },
    { id: 'roupas', name: 'Roupas', emoji: '👗' },
    { id: 'tecnologia', name: 'Tecnologia', emoji: '📱' },
    { id: 'viagem', name: 'Viagem', emoji: '✈️' },
    { id: 'outros', name: 'Outros', emoji: '📦' },
];

const DEFAULT_INCOME = [
    { id: 'salario', name: 'Salário', emoji: '💼' },
    { id: 'freelance', name: 'Freelance', emoji: '💰' },
    { id: 'presente', name: 'Presente', emoji: '🎁' },
    { id: 'investimento', name: 'Investimento', emoji: '📈' },
    { id: 'outros', name: 'Outros', emoji: '📦' },
];

const CURRENCIES = ['EUR', 'USD', 'BRL', 'GBP'];

const EMOJIS = ['💳', '🏦', '🎓', '🐶', '🏋️', '💅', '🍕', '☕', '🎮', '📚', '🛍️', '💄', '🏥', '⚡', '💡', '🚗', '🎵', '🌿'];

export default function AddTransactionScreen() {
    const { addTransaction, currency: defaultCurrency } = useStore();

    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState(defaultCurrency);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isListening, setIsListening] = useState(false);
    const [customCategories, setCustomCategories] = useState({ expense: [], income: [] });

    // Modal nova categoria
    const [modalVisible, setModalVisible] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatEmoji, setNewCatEmoji] = useState('💳');

    useFocusEffect(
        useCallback(() => {
            loadCustomCategories();
            setCurrency(defaultCurrency);
        }, [defaultCurrency])
    );

    const loadCustomCategories = async () => {
        const cats = await getCustomCategories();
        setCustomCategories(cats);
    };

    const allCategories = type === 'expense'
        ? [...DEFAULT_EXPENSE, ...customCategories.expense]
        : [...DEFAULT_INCOME, ...customCategories.income];

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

    const handleAddCategory = async () => {
        if (!newCatName.trim()) {
            Alert.alert('Atenção', 'Digite um nome para a categoria.');
            return;
        }
        await addCustomCategory(type, newCatName.trim(), newCatEmoji);
        await loadCustomCategories();
        setCategory(newCatName.trim());
        setNewCatName('');
        setNewCatEmoji('💳');
        setModalVisible(false);
    };

    const handleVoiceInput = () => {
        setIsListening(true);
        Speech.speak('Diga o valor e a categoria', { language: 'pt-BR' });
        setTimeout(() => {
            setIsListening(false);
            Alert.alert('🎤 Em breve', 'Entrada por voz completa será ativada na próxima versão.');
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Novo lançamento</Text>
                </View>

                {/* Tipo */}
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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
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
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>Categoria</Text>
                        <TouchableOpacity style={styles.addCatBtn} onPress={() => setModalVisible(true)}>
                            <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.addCatText}>Nova</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.categoriesGrid}>
                        {allCategories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryBtn, category === cat.name && styles.categoryBtnActive]}
                                onPress={() => setCategory(cat.name)}
                            >
                                <Text style={[styles.categoryText, category === cat.name && { color: '#fff' }]}>
                                    {cat.emoji} {cat.name}
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
                                : <Ionicons name="mic" size={20} color={COLORS.primary} />}
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

                {/* Salvar */}
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

            {/* Modal nova categoria */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Nova categoria</Text>
                        <Text style={styles.modalSubtitle}>
                            Para {type === 'expense' ? 'gastos' : 'ganhos'}
                        </Text>

                        {/* Escolha de emoji */}
                        <Text style={styles.modalLabel}>Escolha um ícone</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                            {EMOJIS.map(e => (
                                <TouchableOpacity
                                    key={e}
                                    style={[styles.emojiBtn, newCatEmoji === e && styles.emojiBtnActive]}
                                    onPress={() => setNewCatEmoji(e)}
                                >
                                    <Text style={styles.emojiText}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Nome */}
                        <Text style={styles.modalLabel}>Nome da categoria</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Ex: Cartão de crédito, Pet..."
                            placeholderTextColor={COLORS.textSecondary}
                            value={newCatName}
                            onChangeText={setNewCatName}
                            autoFocus
                        />

                        {/* Preview */}
                        {newCatName ? (
                            <View style={styles.previewBox}>
                                <Text style={styles.previewText}>Preview: {newCatEmoji} {newCatName}</Text>
                            </View>
                        ) : null}

                        {/* Botões */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => { setModalVisible(false); setNewCatName(''); }}
                            >
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddCategory}>
                                <Text style={styles.modalSaveText}>Criar</Text>
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
    currencyBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.card, marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
    currencyBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    currencyText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    input: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
    inputMultiline: { height: 80, textAlignVertical: 'top' },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder },
    categoryBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { fontSize: 13, color: COLORS.textSecondary },
    addCatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
    addCatText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    voiceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: COLORS.card, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
    voiceBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 14, marginTop: 4 },
    saveBtnText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
    modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },
    modalLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '500' },
    emojiScroll: { marginBottom: 16 },
    emojiBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.inputBg, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: COLORS.cardBorder },
    emojiBtnActive: { borderColor: COLORS.primary, backgroundColor: '#2A2A4A' },
    emojiText: { fontSize: 22 },
    modalInput: { backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 12 },
    previewBox: { backgroundColor: '#16162A', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 16 },
    previewText: { fontSize: 15, color: COLORS.text },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.inputBg, alignItems: 'center' },
    modalCancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
    modalSaveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center' },
    modalSaveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});