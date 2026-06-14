import { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import useStore from '../store/useStore';
import { getCustomCategories, deleteCustomCategory, clearAllData } from '../database/database';

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

const CURRENCIES = [
    { label: '🇪🇺 Euro', value: 'EUR' },
    { label: '🇺🇸 Dólar', value: 'USD' },
    { label: '🇧🇷 Real', value: 'BRL' },
    { label: '🇬🇧 Libra', value: 'GBP' },
];

export default function SettingsScreen() {
    const { savingGoalPercent, currency, setSavingGoal, setCurrency, loadData } = useStore();
    const [sliderValue, setSliderValue] = useState(savingGoalPercent);
    const [customCategories, setCustomCategories] = useState({ expense: [], income: [] });

    useFocusEffect(
        useCallback(() => {
            loadCustomCategories();
        }, [])
    );

    const loadCustomCategories = async () => {
        const cats = await getCustomCategories();
        setCustomCategories(cats);
    };

    const handleSavingGoalChange = (value) => {
        const rounded = Math.round(value);
        setSliderValue(rounded);
        setSavingGoal(rounded);
    };

    const handleDeleteCategory = (type, id, name) => {
        Alert.alert(
            'Excluir categoria',
            `Quer excluir a categoria "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCustomCategory(type, id);
                        await loadCustomCategories();
                    },
                },
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            '⚠️ Apagar todos os dados',
            'Isso vai deletar todos os lançamentos. Essa ação não pode ser desfeita. Tem certeza?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar tudo',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearAllData();
                            await loadData();
                            Alert.alert('✅ Pronto', 'Todos os dados foram apagados.');
                        } catch (e) {
                            Alert.alert('Erro', 'Não foi possível apagar os dados.');
                        }
                    },
                },
            ]
        );
    };

    const hasCustomCategories = customCategories.expense.length > 0 || customCategories.income.length > 0;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Configurações</Text>
                </View>

                {/* Meta de poupança */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Meta de poupança</Text>
                    <View style={styles.card}>
                        <View style={styles.goalRow}>
                            <Text style={styles.cardText}>Guardar todo mês</Text>
                            <Text style={styles.goalPercent}>{sliderValue}%</Text>
                        </View>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={80}
                            step={5}
                            value={sliderValue}
                            onValueChange={handleSavingGoalChange}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={COLORS.cardBorder}
                            thumbTintColor={COLORS.primary}
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>0%</Text>
                            <Text style={styles.sliderLabel}>20%</Text>
                            <Text style={styles.sliderLabel}>40%</Text>
                            <Text style={styles.sliderLabel}>60%</Text>
                            <Text style={styles.sliderLabel}>80%</Text>
                        </View>
                        <View style={styles.goalHintBox}>
                            <Text style={styles.goalHint}>
                                {sliderValue === 0 ? 'Sem meta definida'
                                    : sliderValue <= 10 ? '👍 Começo sólido!'
                                        : sliderValue <= 20 ? '💪 Ótima meta!'
                                            : sliderValue <= 30 ? '🔥 Disciplina alta!'
                                                : '🚀 Meta agressiva — você é fera!'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Moeda padrão */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💱 Moeda padrão</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardSubtext}>Moeda usada por padrão ao adicionar lançamentos</Text>
                        <View style={styles.currenciesGrid}>
                            {CURRENCIES.map(c => (
                                <TouchableOpacity
                                    key={c.value}
                                    style={[styles.currencyBtn, currency === c.value && styles.currencyBtnActive]}
                                    onPress={() => setCurrency(c.value)}
                                >
                                    <Text style={[styles.currencyLabel, currency === c.value && { color: '#fff' }]}>{c.label}</Text>
                                    {currency === c.value && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Categorias personalizadas */}
                {hasCustomCategories && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🏷️ Categorias personalizadas</Text>
                        <View style={styles.card}>
                            {customCategories.expense.length > 0 && (
                                <>
                                    <Text style={styles.catTypeLabel}>Gastos</Text>
                                    {customCategories.expense.map(cat => (
                                        <View key={cat.id} style={styles.catRow}>
                                            <Text style={styles.catName}>{cat.emoji} {cat.name}</Text>
                                            <TouchableOpacity onPress={() => handleDeleteCategory('expense', cat.id, cat.name)}>
                                                <Ionicons name="trash-outline" size={18} color={COLORS.expense} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </>
                            )}
                            {customCategories.income.length > 0 && (
                                <>
                                    <Text style={[styles.catTypeLabel, { marginTop: 12 }]}>Ganhos</Text>
                                    {customCategories.income.map(cat => (
                                        <View key={cat.id} style={styles.catRow}>
                                            <Text style={styles.catName}>{cat.emoji} {cat.name}</Text>
                                            <TouchableOpacity onPress={() => handleDeleteCategory('income', cat.id, cat.name)}>
                                                <Ionicons name="trash-outline" size={18} color={COLORS.expense} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Sobre */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ Sobre</Text>
                    <View style={styles.card}>
                        <View style={styles.aboutRow}>
                            <Text style={styles.cardText}>FinanceApp</Text>
                            <Text style={styles.cardSubtext}>v1.0.0</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.aboutRow}>
                            <Text style={styles.cardText}>Desenvolvido por</Text>
                            <Text style={styles.cardSubtext}>Yan Guilherme</Text>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.aboutRow}>
                            <Text style={styles.cardText}>Armazenamento</Text>
                            <Text style={styles.cardSubtext}>Local (seu celular)</Text>
                        </View>
                    </View>
                </View>

                {/* Danger zone */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ Zona de perigo</Text>
                    <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
                        <Text style={styles.dangerBtnText}>Apagar todos os dados</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F0F1A' },
    container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
    header: { paddingTop: 20, paddingBottom: 8 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
    cardText: { fontSize: 15, color: COLORS.text },
    cardSubtext: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
    goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    goalPercent: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
    slider: { width: '100%', height: 40 },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
    sliderLabel: { fontSize: 11, color: COLORS.textSecondary },
    goalHintBox: { marginTop: 10, backgroundColor: '#16162A', borderRadius: 8, padding: 10, alignItems: 'center' },
    goalHint: { fontSize: 13, color: COLORS.textSecondary },
    currenciesGrid: { gap: 8, marginTop: 4 },
    currencyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 10, backgroundColor: '#16162A', borderWidth: 1, borderColor: COLORS.cardBorder },
    currencyBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    currencyLabel: { fontSize: 15, color: COLORS.textSecondary },
    catTypeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
    catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
    catName: { fontSize: 15, color: COLORS.text },
    aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    separator: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 8 },
    dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.expense },
    dangerBtnText: { fontSize: 15, color: COLORS.expense, fontWeight: '500' },
});