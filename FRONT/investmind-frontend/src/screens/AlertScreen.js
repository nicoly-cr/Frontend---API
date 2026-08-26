import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { listarAlertas, criarAlerta, deletarAlerta } from '../services/api';

export default function AlertScreen({ route }) {
    const [ticker, setTicker] = useState(route?.params?.ticker || '');
    const [targetPrice, setTargetPrice] = useState('');
    const [tipo, setTipo] = useState('VENDA');
    const [alertas, setAlertas] = useState([]);

    useEffect(() => {
        carregar();
    }, []);

    const carregar = async () => {
        const dados = await listarAlertas();
        setAlertas(dados);
    };

    const handleCadastrar = async () => {
        if (!ticker.trim() || !targetPrice) return Alert.alert('Atenção', 'Preencha todos os campos.');
        const ok = await criarAlerta({ codigo_ativo: ticker.toUpperCase(), preco_alvo: targetPrice, tipo_alerta: tipo });
        if (ok) {
        setTicker('');
        setTargetPrice('');
        carregar();
        } else {
        Alert.alert('Erro', 'Não foi possível cadastrar.');
        }
    };

    const handleExcluir = async (id) => {
        if (await deletarAlerta(id)) carregar();
    };

    return (
        <View style={styles.container}>
        <Text style={styles.header}>Alertas de Preço 🔔</Text>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Novo Alerta</Text>
            <TextInput style={styles.input} placeholder="EX: PETR4" value={ticker} onChangeText={setTicker} autoCapitalize="characters" />
            <TextInput style={styles.input} placeholder="0.00" value={targetPrice} onChangeText={setTargetPrice} keyboardType="numeric" />

            <View style={styles.row}>
            <TouchableOpacity style={[styles.condBtn, tipo === 'VENDA' && styles.condActiveVenda]} onPress={() => setTipo('VENDA')}>
                <Text style={[styles.condText, tipo === 'VENDA' && { color: '#cc007a', fontWeight: 'bold' }]}>📈 Subir (Venda)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.condBtn, tipo === 'COMPRA' && styles.condActiveCompra]} onPress={() => setTipo('COMPRA')}>
                <Text style={[styles.condText, tipo === 'COMPRA' && { color: '#137333', fontWeight: 'bold' }]}>📉 Cair (Compra)</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleCadastrar}>
            <Text style={styles.btnText}>Cadastrar Alerta</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>Seus Alertas Ativos</Text>
        <FlatList
            data={alertas}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
            <View style={styles.alertItem}>
                <View>
                <Text style={styles.bold}>{item.codigo_ativo || item.ticker}</Text>
                <Text style={{ color: item.tipo_alerta === 'COMPRA' ? '#137333' : '#cc007a', fontSize: 10 }}>
                    {item.tipo_alerta === 'COMPRA' ? 'Compra' : 'Venda'}
                </Text>
                </View>
                <Text>R$ {parseFloat(item.preco_alvo || 0).toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleExcluir(item.id)}>
                <Text>🗑️</Text>
                </TouchableOpacity>
            </View>
            )}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 8 },
    row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    condBtn: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, alignItems: 'center' },
    condActiveVenda: { borderColor: '#cc007a', backgroundColor: '#fce6f2' },
    condActiveCompra: { borderColor: '#137333', backgroundColor: '#e6f4ea' },
    condText: { fontSize: 11, color: '#666' },
    btnPrimary: { backgroundColor: '#cc007a', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    alertItem: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    bold: { fontWeight: 'bold' }
});