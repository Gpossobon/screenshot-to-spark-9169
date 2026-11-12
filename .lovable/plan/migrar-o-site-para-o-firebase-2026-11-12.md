# Migrar o site para o Firebase

## O que muda para você
- Login, cadastro, recuperação de senha, "Complete seu cadastro", "Minha Equipe" e "Aprovar capitães" passam a usar o seu projeto Firebase (mousetrapraceuniritter).
- As contas atuais não migram: todos (inclusive você) precisam criar a conta de novo.
- O visual e as regras continuam iguais: senha (7+ caracteres, letra e número, sem especiais), equipe com até 5 pessoas incluindo o capitão, capitão só após sua aprovação, uma equipe por pessoa.
- O portal público (/inicio etc.) não muda.

## O que você precisa fazer no console do Firebase (eu passo o passo a passo)
1. Authentication → ativar "E-mail/senha".
2. Firestore Database → criar o banco.
3. Firestore → Regras → colar as regras de segurança que eu vou gerar (arquivo `firestore.rules`) e publicar.
4. Depois de criar sua conta, me avisar para eu marcar você como administrador (ou criar o documento `admins/{seu uid}` no console).

## Detalhes técnicos
- `bun add firebase`; `src/integrations/firebase/client.ts` com a config enviada (chaves web são públicas), inicialização lazy só no navegador.
- Auth: `createUserWithEmailAndPassword` + `sendEmailVerification`, `signInWithEmailAndPassword`, `sendPasswordResetEmail` (redefinição via página do Firebase ou `/reset-password` com `confirmPasswordReset` usando `oobCode`), `signOut`. `useAuthSession` e o gate `_authenticated` passam a usar `onAuthStateChanged`. Tradução de erros em `auth-validation.ts` atualizada para códigos `auth/*` (teste atualizado).
- Firestore: `profiles/{uid}` (nome, RA, campus, turma), `captainRequests/{uid}`, `admins/{uid}`, `teams/{teamId}` com `members` e `memberIndex/{uid}` para garantir uma equipe por pessoa. Operações de equipe via transações no cliente; as regras de tamanho, capitão e aprovação ficam em `firestore.rules` (não dá para impor só na página).
- Busca de participantes: consulta por prefixo de nome em `profiles` (RA visível só para usuários logados).
- Remoção do código do backend atual nessas telas; tabelas antigas ficam intactas (sem apagar dados).
- Atualizar AGENTS.md e testes de regras (`team-rules`, `captain-requests`, `auth-validation`).

## Limitações
- Não consigo publicar as regras nem ativar serviços no seu Firebase; sem o passo 3 o banco fica aberto ou bloqueado.
- Aviso de capitão por e-mail continua adiado.
