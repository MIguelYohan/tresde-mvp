/**
 * Módulo de Validações do Sistema TresDê
 * Validações de CPF, CNPJ, CEP, Maioridade, Senha, Datas e Formatos.
 */

const Validators = {
    /**
     * Valida nome: texto, obrigatório, não pode iniciar com números ou caracteres especiais
     */
    validateText(value) {
        const words = String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z]+/g) || [];
        const prohibited = new Set(['porra', 'caralho', 'merda', 'puta', 'foder', 'foda', 'buceta', 'fdp']);
        return words.some(word => prohibited.has(word))
            ? { valid: false, message: 'Revise o texto: palavras ofensivas não são permitidas.' }
            : { valid: true };
    },

    validateName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, message: 'O nome é obrigatório.' };
        }
        const trimmed = name.trim();
        if (trimmed.length < 3) {
            return { valid: false, message: 'O nome deve ter no mínimo 3 caracteres.' };
        }
        // Não pode iniciar com números ou caracteres especiais
        const startRegex = /^[A-Za-zÀ-ÿ]/;
        if (!startRegex.test(trimmed)) {
            return { valid: false, message: 'O nome não pode iniciar com números ou caracteres especiais.' };
        }
        // Deve conter apenas letras, acentos e espaços
        const nameRegex = /^[A-Za-zÀ-ÿ\s.'-]+$/;
        if (!nameRegex.test(trimmed)) {
            return { valid: false, message: 'O nome deve conter apenas letras e espaços.' };
        }
        return { valid: true };
    },

    /**
     * Valida CPF com algoritmo dos dígitos verificadores
     */
    validateCPF(cpf) {
        if (!cpf) return { valid: false, message: 'O CPF é obrigatório.' };
        const clean = cpf.replace(/\D/g, '');
        if (clean.length !== 11) {
            return { valid: false, message: 'O CPF deve conter exatamente 11 dígitos numéricos.' };
        }
        // Rejeita sequências de dígitos iguais
        if (/^(\d)\1{10}$/.test(clean)) {
            return { valid: false, message: 'CPF inválido (dígitos repetidos).' };
        }

        // Primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(clean.charAt(i), 10) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(9), 10)) {
            return { valid: false, message: 'CPF inválido (dígito verificador incorreto).' };
        }

        // Segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(clean.charAt(i), 10) * (11 - i);
        }
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(10), 10)) {
            return { valid: false, message: 'CPF inválido (dígito verificador incorreto).' };
        }

        return { valid: true };
    },

    /**
     * Valida CNPJ com algoritmo dos dígitos verificadores
     */
    validateCNPJ(cnpj) {
        if (!cnpj) return { valid: false, message: 'O CNPJ é obrigatório.' };
        const clean = cnpj.replace(/\D/g, '');
        if (clean.length !== 14) {
            return { valid: false, message: 'O CNPJ deve conter exatamente 14 dígitos numéricos.' };
        }
        if (/^(\d)\1{13}$/.test(clean)) {
            return { valid: false, message: 'CNPJ inválido (dígitos repetidos).' };
        }

        // 1º dígito verificador
        let size = clean.length - 2;
        let numbers = clean.substring(0, size);
        let digits = clean.substring(size);
        let sum = 0;
        let pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i), 10) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(0), 10)) {
            return { valid: false, message: 'CNPJ inválido (dígito verificador incorreto).' };
        }

        // 2º dígito verificador
        size = size + 1;
        numbers = clean.substring(0, size);
        sum = 0;
        pos = size - 7;
        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i), 10) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(1), 10)) {
            return { valid: false, message: 'CNPJ inválido (dígito verificador incorreto).' };
        }

        return { valid: true };
    },

    /**
     * Valida Data de Nascimento: obrigatória, anterior à data atual e usuário maior de 18 anos
     */
    validateBirthDate(birthDateStr) {
        if (!birthDateStr) {
            return { valid: false, message: 'A data de nascimento é obrigatória.' };
        }
        const birthDate = new Date(birthDateStr + 'T00:00:00');
        if (isNaN(birthDate.getTime())) {
            return { valid: false, message: 'Data de nascimento inválida.' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (birthDate >= today) {
            return { valid: false, message: 'A data de nascimento deve ser anterior à data atual.' };
        }

        // Verifica maioridade (18 anos)
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            return { valid: false, message: `Usuário deve ser maior de idade (18 anos ou mais). Idade informada: ${age} anos.` };
        }

        return { valid: true, age };
    },

    /**
     * Valida Senha: texto, obrigatória, sem espaços, com mais de 4 caracteres, alfanumérica
     */
    validatePassword(password) {
        if (!password) {
            return { valid: false, message: 'A senha é obrigatória.' };
        }
        if (/\s/.test(password)) {
            return { valid: false, message: 'A senha não pode conter espaços.' };
        }
        if (password.length <= 4) {
            return { valid: false, message: 'A senha deve ter mais de 4 caracteres (no mínimo 5).' };
        }
        // Deve ser alfanumérica (conter letras e números)
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (!hasLetter || !hasNumber) {
            return { valid: false, message: 'A senha deve ser alfanumérica (conter ao menos letras e números).' };
        }

        return { valid: true };
    },

    /**
     * Valida E-mail
     */
    validateEmail(email) {
        if (!email) {
            return { valid: false, message: 'O e-mail é obrigatório.' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return { valid: false, message: 'Formato de e-mail inválido.' };
        }
        return { valid: true };
    },

    /**
     * Valida Telefone: não obrigatório, mas se informado deve ter formato válido (10 ou 11 dígitos com DDD)
     */
    validatePhone(phone) {
        if (!phone || phone.trim() === '') {
            return { valid: true }; // Opcional
        }
        const clean = phone.replace(/\D/g, '');
        if (clean.length !== 10 && clean.length !== 11) {
            return { valid: false, message: 'Telefone inválido. Informe DDD + 8 ou 9 dígitos (ex: (11) 98765-4321).' };
        }
        return { valid: true };
    },

    /**
     * Valida CEP e consulta API ViaCEP
     */
    async validateAndFetchCEP(cep) {
        if (!cep) {
            return { valid: false, message: 'O CEP é obrigatório.' };
        }
        const clean = cep.replace(/\D/g, '');
        if (clean.length !== 8) {
            return { valid: false, message: 'O CEP deve conter exatamente 8 dígitos.' };
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            if (!response.ok) {
                return { valid: false, message: 'Erro ao consultar serviço de CEP.' };
            }
            const data = await response.json();
            if (data.erro) {
                return { valid: false, message: 'CEP não encontrado na base dos Correios.' };
            }

            return {
                valid: true,
                address: {
                    cep: data.cep,
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    uf: data.uf || '',
                    ibge: data.ibge || ''
                }
            };
        } catch (error) {
            console.warn('ViaCEP offline ou sem conexão. Usando fallback offline para protótipo:', error);
            // Em caso de falha de conexão de rede, fornecer fallback de CEP válido
            return {
                valid: true,
                address: {
                    cep: clean.replace(/^(\d{5})(\d{3})$/, '$1-$2'),
                    logradouro: 'Logradouro não consultado (modo offline)',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    uf: 'SP',
                    offlineNotice: true
                }
            };
        }
    },

    /**
     * Valida data futura (para prazos de entrega / orçamento)
     */
    validateFutureDate(dateStr) {
        if (!dateStr) {
            return { valid: false, message: 'O prazo desejado é obrigatório.' };
        }
        const inputDate = new Date(dateStr + 'T00:00:00');
        if (isNaN(inputDate.getTime())) {
            return { valid: false, message: 'Data inválida.' };
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (inputDate <= today) {
            return { valid: false, message: 'O prazo deve ser uma data posterior à data atual.' };
        }
        return { valid: true };
    },

    /**
     * Formatação utilitária de CPF, CNPJ, CEP e Telefone
     */
    formatCPF(cpf) {
        const clean = (cpf || '').replace(/\D/g, '').slice(0, 11);
        return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    formatCNPJ(cnpj) {
        const clean = (cnpj || '').replace(/\D/g, '').slice(0, 14);
        return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    },

    formatCEP(cep) {
        const clean = (cep || '').replace(/\D/g, '').slice(0, 8);
        return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    },

    formatPhone(phone) {
        const clean = (phone || '').replace(/\D/g, '').slice(0, 11);
        if (clean.length === 11) {
            return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (clean.length === 10) {
            return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        }
        return clean;
    }
};

window.Validators = Validators;
