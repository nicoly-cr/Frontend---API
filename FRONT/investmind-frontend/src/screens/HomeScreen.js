import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { buscarCotacao } from '../services/api';
import { obterFavoritos, salvarFavorito, removerFavorito } from '../storage/storage';

export default function HomeScreen({ navigation }) {
    const [ticker, setTicker] = useState('PETR4');
    const [asset, setAsset] = useState(null);
    const [favoritosDados, setFavoritosDados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        carregar();
    }, []);

    const carregar = async () => {
        const favs = await obterFavoritos();
        const dados = await Promise.all(favs.map(t => buscarCotacao(t)));
        setFavoritosDados(dados.filter(Boolean));
    };

    const handleSearch = async (simbolo) => {
        const t = (simbolo || ticker).toUpperCase();
        if (!t) return;
        setLoading(true);
        const res = await buscarCotacao(t);
        if (res) {
        setAsset(res);
        const favs = await obterFavoritos();
        setIsFav(favs.includes(t));
        } else {
        Alert.alert('Erro', 'Ativo não encontrado.');
        }
        setLoading(false);
    };

    const toggleFav = async () => {
        if (!asset) return;
        const sim = asset.symbol || ticker.toUpperCase();
        if (isFav) {
        await removerFavorito(sim);
        } else {
        await salvarFavorito(sim);
        }
        setIsFav(!isFav);
        carregar();
    };

    return (
        <ScrollView style={styles.container}>
        <View style={styles.row}>
            <TextInput
            style={styles.input}
            placeholder="Digite o ticker (ex: MGLU3)..."
            value={ticker}
            onChangeText={setTicker}
            autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.btnPrimary} onPress={() => handleSearch()}>
            <Text style={styles.btnText}>Buscar</Text>
            </TouchableOpacity>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#cc007a" style={{ marginVertical: 20 }} />
        ) : asset ? (
            <View style={styles.card}>
            <Text style={styles.title}>{asset.symbol || ticker.toUpperCase()}</Text>
            <Text style={styles.sub}>{asset.longName || asset.shortName || 'Ação B3'}</Text>
            <Text style={styles.label}>Cotação Atual</Text>
            <View style={styles.priceRow}>
                <Text style={styles.price}>R$ {asset.regularMarketPrice?.toFixed(2) || '0.00'}</Text>
                <View style={[styles.badge, { backgroundColor: (asset.regularMarketChangePercent || 0) >= 0 ? '#e6f4ea' : '#fce8e6' }]}>
                <Text style={{ color: (asset.regularMarketChangePercent || 0) >= 0 ? '#137333' : '#c5221f', fontWeight: 'bold' }}>
                    {(asset.regularMarketChangePercent || 0) >= 0 ? '▲ ' : '▼ '}
                    {asset.regularMarketChangePercent?.toFixed(2) || '0.00'}%
                </Text>
                </View>
            </View>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.btnOutline, isFav && styles.favActive]} onPress={toggleFav}>
                <Text style={[styles.btnOutlineText, isFav && { color: '#cc007a' }]}>{isFav ? '⭐ Favorito' : '✩ Favorito'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Alerts', { ticker: asset.symbol || ticker })}>
                <Text style={styles.btnText}>🔔 Criar Alerta</Text>
                </TouchableOpacity>
            </View>
            </View>
        ) : null}

        <Text style={styles.sectionTitle}>Favoritos</Text>
        <FlatList
            data={favoritosDados}
            horizontal
            keyExtractor={(i) => i.symbol}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
            <TouchableOpacity style={styles.favCard} onPress={() => { setTicker(item.symbol); handleSearch(item.symbol); }}>
                <Text style={styles.favTicker}>{item.symbol}</Text>
                <Text style={styles.favPrice}>R$ {item.regularMarketPrice?.toFixed(2) || '0.00'}</Text>
                <Text style={{ color: (item.regularMarketChangePercent || 0) >= 0 ? '#137333' : '#c5221f', fontSize: 12, fontWeight: 'bold' }}>
                {(item.regularMarketChangePercent || 0) >= 0 ? '▲ ' : '▼ '}
                {item.regularMarketChangePercent?.toFixed(2) || '0.00'}%
                </Text>
            </TouchableOpacity>
            )}
        />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
    row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, height: 48 },
    btnPrimary: { flex: 1, backgroundColor: '#cc007a', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', height: 48 },
    btnText: { color: '#fff', fontWeight: 'bold' },
    btnOutline: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, height: 48, justifyContent: 'center', alignItems: 'center' },
    btnOutlineText: { color: '#444', fontWeight: '600' },
    favActive: { borderColor: '#cc007a', backgroundColor: '#fce6f2' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, elevation: 2 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    sub: { fontSize: 12, color: '#666', marginBottom: 8 },
    label: { fontSize: 12, color: '#888' },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
    price: { fontSize: 24, fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    favCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginRight: 10, width: 100, borderWidth: 1, borderColor: '#eee' },
    favTicker: { fontWeight: 'bold' },
    favPrice: { fontSize: 12, marginVertical: 4 }
});