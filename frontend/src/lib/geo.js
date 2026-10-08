/**
 * Módulo de Proximidade e Geolocalização do Sistema TresDê
 * Calcula distâncias aproximadas entre CEPs e cidades brasileiras
 * para exibição de raio geográfico e filtros de localização.
 */

const GeoService = {
    // Coordenadas centrais aproximadas por UF no Brasil
    ufCoordinates: {
        'SP': { lat: -23.5505, lon: -46.6333, name: 'São Paulo' },
        'RJ': { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro' },
        'MG': { lat: -19.9167, lon: -43.9345, name: 'Belo Horizonte' },
        'ES': { lat: -20.3155, lon: -40.3128, name: 'Vitória' },
        'PR': { lat: -25.4284, lon: -49.2733, name: 'Curitiba' },
        'SC': { lat: -27.5954, lon: -48.5480, name: 'Florianópolis' },
        'RS': { lat: -30.0346, lon: -51.2177, name: 'Porto Alegre' },
        'BA': { lat: -12.9777, lon: -38.5016, name: 'Salvador' },
        'PE': { lat: -8.0476, lon: -34.8770, name: 'Recife' },
        'CE': { lat: -3.7319, lon: -38.5267, name: 'Fortaleza' },
        'DF': { lat: -15.7975, lon: -47.8919, name: 'Brasília' },
        'GO': { lat: -16.6869, lon: -49.2648, name: 'Goiânia' },
        'PA': { lat: -1.4558, lon: -48.4902, name: 'Belém' },
        'AM': { lat: -3.1190, lon: -60.0217, name: 'Manaus' },
        'MT': { lat: -15.6014, lon: -56.0979, name: 'Cuiabá' },
        'MS': { lat: -20.4697, lon: -54.6201, name: 'Campo Grande' },
        'RN': { lat: -5.7945, lon: -35.2110, name: 'Natal' },
        'PB': { lat: -7.1195, lon: -34.8450, name: 'João Pessoa' },
        'AL': { lat: -9.6658, lon: -35.7353, name: 'Maceió' },
        'SE': { lat: -10.9472, lon: -37.0731, name: 'Aracaju' },
        'PI': { lat: -5.0920, lon: -42.8038, name: 'Teresina' },
        'MA': { lat: -2.5307, lon: -44.3068, name: 'São Luís' },
        'RO': { lat: -8.7612, lon: -63.9039, name: 'Porto Velho' },
        'AC': { lat: -9.9754, lon: -67.8249, name: 'Rio Branco' },
        'TO': { lat: -10.1844, lon: -48.3336, name: 'Palmas' },
        'AP': { lat: 0.0356, lon: -51.0705, name: 'Macapá' },
        'RR': { lat: 2.8235, lon: -60.6758, name: 'Boa Vista' }
    },

    /**
     * Mapeamento aproximado baseado no primeiro dígito do CEP
     */
    cepPrefixToUF(cep) {
        if (!cep) return 'SP';
        const clean = cep.replace(/\D/g, '');
        const d1 = parseInt(clean.charAt(0), 10);
        const d2 = clean.length > 1 ? parseInt(clean.substring(0, 2), 10) : 0;

        if (d1 === 0 || (d1 === 1 && d2 <= 19)) return 'SP';
        if (d2 >= 20 && d2 <= 28) return 'RJ';
        if (d2 === 29) return 'ES';
        if (d1 === 3) return 'MG';
        if (d2 >= 40 && d2 <= 48) return 'BA';
        if (d2 === 49) return 'SE';
        if (d2 >= 50 && d2 <= 56) return 'PE';
        if (d2 === 57) return 'AL';
        if (d2 === 58) return 'PB';
        if (d2 === 59) return 'RN';
        if (d2 >= 60 && d2 <= 63) return 'CE';
        if (d2 === 64) return 'PI';
        if (d2 === 65) return 'MA';
        if (d2 >= 66 && d2 <= 68) return 'PA';
        if (d2 === 69) return 'AM';
        if (d1 === 7 && d2 <= 72) return 'DF';
        if (d1 === 7 && d2 >= 73 && d2 <= 76) return 'GO';
        if (d1 === 7 && d2 === 77) return 'TO';
        if (d1 === 7 && d2 === 78) return 'MT';
        if (d1 === 7 && d2 === 79) return 'MS';
        if (d1 === 8) return 'PR';
        if (d1 === 9) return 'RS';
        return 'SP';
    },

    /**
     * Fórmula de Haversine para cálculo de distância entre duas coordenadas (lat/lon)
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    /**
     * Calcula a proximidade entre dois endereços (CEP ou UF/Cidade)
     * Retorna objeto com km aproximado, label e faixa
     */
    calculateProximity(addr1, addr2) {
        if (!addr1 || !addr2) {
            return { distanceKm: null, label: 'Localização não informada', badgeClass: 'badge-secondary' };
        }

        const uf1 = (addr1.uf || this.cepPrefixToUF(addr1.cep) || 'SP').toUpperCase();
        const uf2 = (addr2.uf || this.cepPrefixToUF(addr2.cep) || 'SP').toUpperCase();
        const cidade1 = (addr1.cidade || '').trim().toLowerCase();
        const cidade2 = (addr2.cidade || '').trim().toLowerCase();

        // Se mesma cidade e mesmo CEP ou bairros próximos
        if (cidade1 && cidade2 && cidade1 === cidade2 && uf1 === uf2) {
            const cep1Clean = (addr1.cep || '').replace(/\D/g, '');
            const cep2Clean = (addr2.cep || '').replace(/\D/g, '');
            let km = 4.8;
            if (cep1Clean && cep2Clean) {
                const diff = Math.abs(parseInt(cep1Clean.substring(0, 5), 10) - parseInt(cep2Clean.substring(0, 5), 10));
                km = Math.min(25, Math.max(1.5, Math.round((diff * 0.4 + 2) * 10) / 10));
            }
            return {
                distanceKm: km,
                label: `Aprox. ${km} km (${addr1.cidade || 'Mesma Cidade'})`,
                description: 'Excelente proximidade para entrega rápida ou retirada presencial',
                badgeClass: 'badge-success',
                withinRadius: (radius) => km <= radius
            };
        }

        const coord1 = this.ufCoordinates[uf1] || this.ufCoordinates['SP'];
        const coord2 = this.ufCoordinates[uf2] || this.ufCoordinates['SP'];

        let km = Math.round(this.haversineDistance(coord1.lat, coord1.lon, coord2.lat, coord2.lon));

        if (uf1 === uf2) {
            km = Math.max(15, Math.round(km * 0.35 + 25)); // mesma UF cidades diferentes
            return {
                distanceKm: km,
                label: `Aprox. ${km} km (${uf1} - Interior/Região)`,
                description: 'Mesmo estado, envio econômico via transportadora ou Correios',
                badgeClass: 'badge-info',
                withinRadius: (radius) => km <= radius
            };
        }

        return {
            distanceKm: km,
            label: `Aprox. ${km} km (${uf1} ➔ ${uf2})`,
            description: 'Envio interestadual (SEDEX / PAC / Transportadora)',
            badgeClass: 'badge-warning',
            withinRadius: (radius) => km <= radius
        };
    }
};

export default GeoService;
