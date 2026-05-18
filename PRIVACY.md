# Política de Privacidade — Guitar Architect

**Última atualização:** 18 de maio de 2026

O Guitar Architect respeita a sua privacidade e trata dados pessoais de acordo com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD). Esta Política explica quais dados podem ser tratados, para quais finalidades, como funciona a sincronização em nuvem e quais direitos você possui.

Esta política se aplica ao uso do Guitar Architect em:

> [https://www.guitararchitect.app.br](https://www.guitararchitect.app.br)

---

## 1. Quem controla os dados

Para fins da LGPD, o Guitar Architect atua como controlador dos dados tratados para funcionamento da conta, sincronização, evolução do usuário, conquistas, instrumentos e projetos.

**Contato para privacidade e solicitações LGPD:**  
[contato@guitararchitect.com.br](mailto:contato@guitararchitect.com.br)

Até que haja indicação formal de encarregado específico, este e-mail também funciona como canal de contato para assuntos de proteção de dados.

---

## 2. Dados que podemos tratar

Dependendo de como você usa o app, podemos tratar:

- **Dados de conta:** e-mail, identificador de usuário, senha gerenciada pelo provedor de autenticação, data de criação e último acesso.
- **Dados de perfil:** nome de exibição, telefone, endereço, logotipo próprio para exportações e preferências visuais.
- **Projetos e diagramas:** diagramas criados, notas, escalas, acordes, configurações de fretboard, exportações e preferências de visualização.
- **Instrumentos:** instrumentos cadastrados, afinações, fotos, número de série, preço, manutenção, observações e metadados inseridos pelo usuário.
- **Evolução no app:** exercícios concluídos, progresso, conquistas, recompensas, badges/logos selecionados, streaks, uso de módulos, metrônomo, afinador e ações de estudo.
- **Dados técnicos:** informações necessárias para login, sincronização, segurança, funcionamento do navegador, armazenamento local e prevenção de erros.

Não solicitamos dados bancários nesta fase. Caso recursos pagos, assinaturas, marketplace ou transferências sejam implementados no futuro, a política será atualizada antes da coleta desses dados.

---

## 3. Como os dados são armazenados

O Guitar Architect usa uma arquitetura híbrida:

- **No navegador:** dados podem ser salvos em localStorage/armazenamento local para funcionamento rápido, uso offline parcial, preferências e migração.
- **Na nuvem:** quando você cria conta e faz login, um snapshot do seu estado pode ser sincronizado com o Supabase, incluindo projetos, instrumentos, perfil, conquistas, coleção e preferências.
- **Arquivo JSON:** a exportação/importação JSON permanece como backup, portabilidade e compartilhamento manual de projetos.

O armazenamento local depende do navegador e do dispositivo. Se você limpar os dados do navegador, usar modo anônimo ou trocar de dispositivo sem sincronizar/exportar, dados locais podem ser perdidos.

---

## 4. Finalidades do tratamento

Tratamos dados para:

- criar e manter sua conta;
- salvar e sincronizar projetos, instrumentos, perfil e preferências;
- permitir importação, exportação e portabilidade de projetos;
- registrar evolução, conquistas, recompensas e desbloqueios;
- permitir personalização visual, incluindo logos/badges selecionados;
- melhorar estabilidade, segurança e experiência do usuário;
- responder solicitações de suporte, privacidade e recuperação de acesso;
- cumprir obrigações legais, regulatórias ou ordens de autoridade competente, quando aplicável.

---

## 5. Bases legais LGPD

As bases legais podem incluir:

- **execução de contrato ou procedimentos preliminares:** para criar conta, autenticar, salvar e sincronizar dados;
- **consentimento:** para informações opcionais de perfil, logotipo próprio ou recursos que dependam de autorização específica;
- **legítimo interesse:** para segurança, prevenção de abuso, melhoria técnica e continuidade do serviço;
- **cumprimento de obrigação legal ou regulatória:** quando a lei exigir retenção ou resposta a autoridades;
- **exercício regular de direitos:** em procedimentos administrativos, judiciais ou arbitrais, quando necessário.

---

## 6. Compartilhamento com terceiros

Podemos usar prestadores de serviço para hospedar, autenticar e sincronizar o app:

- **Vercel:** hospedagem, CDN e entrega da aplicação.
- **Supabase:** autenticação, banco de dados e sincronização de snapshots do usuário.
- **Provedores de e-mail ou suporte:** quando você entra em contato conosco.

Esses prestadores atuam como operadores ou fornecedores técnicos e devem tratar dados conforme suas próprias políticas, contratos e medidas de segurança.

Não vendemos seus dados pessoais.

---

## 7. Transferência internacional

Os fornecedores de infraestrutura podem operar servidores, backups ou serviços fora do Brasil. Quando houver transferência internacional, ela deverá observar as hipóteses permitidas pela LGPD e medidas razoáveis de segurança e governança.

---

## 8. Segurança

Adotamos medidas técnicas e organizacionais compatíveis com o estágio atual do app, incluindo:

- conexão HTTPS;
- autenticação via Supabase Auth;
- políticas de Row Level Security (RLS) para que cada usuário acesse seu próprio snapshot;
- uso de variáveis de ambiente para chaves públicas de cliente;
- separação entre dados públicos e dados privados;
- orientação para manter logos bloqueadas fora da pasta pública quando proteção real for necessária.

Nenhum sistema é totalmente imune a falhas. O usuário também deve proteger sua senha, dispositivo, navegador e conta de e-mail.

---

## 9. Logos, imagens bloqueadas e recompensas

Algumas logos, headstocks, badges e recompensas podem aparecer bloqueadas até que critérios de desbloqueio sejam cumpridos. Enquanto imagens oficiais bloqueadas não forem públicas, o app pode exibir placeholders, silhuetas ou versões reduzidas.

Para proteção real de assets ainda não desbloqueados, a estratégia recomendada é armazená-los fora de `/public`, preferencialmente em bucket privado, com acesso por URL assinada somente após desbloqueio.

---

## 10. Migração de usuários locais

Usuários que usavam perfis locais antes da conta em nuvem podem migrar seus dados para uma conta autenticada.

O app exibirá aviso de migração por 30 dias, com prazo informado até **17 de junho de 2026**. Após esse período, poderemos remover ou limitar o fluxo guiado de migração, embora a importação por JSON possa continuar disponível como alternativa de portabilidade.

---

## 11. Retenção e exclusão

Mantemos dados enquanto forem necessários para as finalidades descritas nesta política, enquanto a conta estiver ativa ou enquanto houver obrigação legal, segurança, prevenção de fraude, suporte ou exercício de direitos.

Você pode solicitar exclusão da conta e dos dados associados pelo e-mail de contato. Alguns dados podem permanecer por período adicional em backups, logs técnicos ou quando a retenção for necessária por obrigação legal ou defesa de direitos.

Dados salvos localmente no navegador podem ser apagados pelo próprio usuário ao limpar dados do site no navegador.

---

## 12. Direitos do titular

Nos termos da LGPD, você pode solicitar:

- confirmação de tratamento;
- acesso aos dados;
- correção de dados incompletos, inexatos ou desatualizados;
- anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;
- portabilidade, quando aplicável;
- informação sobre compartilhamento;
- informação sobre a possibilidade de não fornecer consentimento e consequências;
- revogação de consentimento;
- revisão de decisões automatizadas, caso venham a existir;
- eliminação de dados tratados com base no consentimento, observadas hipóteses legais de retenção.

Você também pode peticionar perante a Autoridade Nacional de Proteção de Dados (ANPD).

---

## 13. Crianças e adolescentes

O Guitar Architect é voltado ao estudo musical e não é direcionado especificamente a crianças. Menores de idade devem usar o app com autorização e acompanhamento de responsável legal, especialmente quando houver criação de conta ou inserção de dados pessoais.

---

## 14. Cookies e armazenamento local

O app pode usar armazenamento local e tecnologias similares para manter sessão, preferências, projetos, instrumentos, conquistas e estado da aplicação.

Não utilizamos cookies de publicidade comportamental nesta fase. Se analytics, marketing ou cookies não essenciais forem adicionados, esta política será atualizada e os controles necessários serão implementados.

---

## 15. Compartilhamento de projetos e instrumentos

O JSON continua sendo uma forma de backup e compartilhamento manual. Com a evolução do backend, poderemos implementar links de compartilhamento, permissões por usuário, cópia de projetos públicos, bibliotecas colaborativas ou instrumentos compartilhados.

Até que esse fluxo esteja disponível, o usuário deve ter cuidado ao importar arquivos JSON recebidos de terceiros e ao exportar dados que contenham informações pessoais, fotos ou detalhes de instrumentos.

---

## 16. Alterações nesta política

Esta política pode ser atualizada para refletir mudanças no app, em fornecedores, em recursos pagos, em segurança ou na legislação.

A data da última atualização será sempre indicada no topo do documento. Alterações relevantes poderão ser comunicadas dentro do app ou por outros meios adequados.

---

## 17. Contato

Para dúvidas, solicitações de privacidade, LGPD, exclusão de conta, correção de dados, portabilidade ou suporte:

**E-mail:** [contato@guitararchitect.com.br](mailto:contato@guitararchitect.com.br)

---

**Guitar Architect**  
Visualize a harmonia. Estruture seu fretboard.
