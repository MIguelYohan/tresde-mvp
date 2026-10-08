As regras atuais são executadas por funções PostgreSQL transacionais nas migrations.
Nenhuma Edge Function é necessária para os fluxos existentes.

O pagamento continua sendo uma simulação. Uma futura integração real deve usar
uma Edge Function com segredo do provedor no servidor e confirmação por webhook;
nunca confiar em um valor ou comprovante de pagamento enviado pelo navegador.
