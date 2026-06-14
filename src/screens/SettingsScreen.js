import { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ScrollView, Alert, Switch
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const CURRENCIES = [
    { label: '🇪🇺 Euro', value: 'EUR' },
    { label: '🇺🇸 Dólar', value: 'USD' },
    { label: '🇧🇷 Real', value: 'BRL' },
    { label: '🇬🇧 Libra', value: 'GBP' },
];

export default function SettingsScreen() {
    const { savingGoalPercent, currency, setSavingGoal, setCurrency } = useStore();
    const [sliderValue, setSliderValue] = useState(savingGoalPercent);

    const handleSavingGoalChange = (value) => {
        const rounded = Math.round(value);
        setSliderValue(rounded);
        setSavingGoal(rounded);
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
                        await AsyncStorage.removeItem('transactions');
                        useStore.getState().loadData();
                        Alert.alert('✅ Pronto', 'Todos os dados foram apagados.');
                    },
                },
            ]
        );
    };

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
                                {sliderValue === 0
                                    ? 'Sem meta definida'
                                    : sliderValue <= 10
                                        ? '👍 Começo sólido!'
                                        : sliderValue <= 20
                                            ? '💪 Ótima meta!'
                                            : sliderValue <= 30
                                                ? '🔥 Disciplina alta!'
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
                                    <Text style={[styles.currencyLabel, currency === c.value && { color: '#fff' }]}>
                                        {c.label}
                                    </Text>
                                    {currency === c.value && (
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Sobre o app */}
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
    aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    separator: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 8 },
    dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.expense },
    dangerBtnText: { fontSize: 15, color: COLORS.expense, fontWeight: '500' },
});