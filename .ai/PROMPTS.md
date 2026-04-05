# Prompts para copiar e colar no Kiro / Antigravity

---

## 🟢 PROMPT DE INÍCIO DE SESSÃO
*(cole isso no começo de cada nova sessão)*

```
Você vai trabalhar no projeto TarifaZero. Antes de qualquer coisa, leia os arquivos na pasta .ai/ nesta ordem:

1. `.ai/project.md` — entenda o sistema, stack e estrutura
2. `.ai/conventions.md` — siga esses padrões rigorosamente, sem exceção
3. `.ai/decisions.md` — entenda o porquê das escolhas técnicas
4. `.ai/progress.md` — veja o que já foi feito e o backlog
5. `.ai/current-task.md` — isso define o que faremos agora

Após ler todos os arquivos, me responda:
- Em 2-3 linhas: o que é o projeto e qual é a stack
- O que foi feito na última sessão (do current-task.md)
- O que você entende que faremos agora

Só então aguarde minha instrução para começar.
```

---

## 🔴 PROMPT DE FIM DE SESSÃO
*(cole isso antes de fechar, para o agente atualizar o current-task.md)*

```
Antes de encerrarmos, atualize o arquivo `.ai/current-task.md` com:

1. O que foi feito nesta sessão (seção "✅ O que foi feito")
2. Onde exatamente paramos — arquivo, função, linha se relevante
3. Próximos passos sugeridos (seção "➡️ Próximos passos")
4. Qualquer decisão técnica tomada (e adicione também em decisions.md se for importante)
5. Alguma armadilha ou problema descoberto (seção "⚠️ Atenção")

Após atualizar, me mostre o conteúdo final do arquivo.
```

---

## 💡 DICA: Tarefa específica no meio da sessão

Se o agente se perder ou mudar de assunto, use:

```
Pare. Releia `.ai/current-task.md` e foque apenas no passo X da lista.
Não faça mais nada além disso até eu confirmar.
```
