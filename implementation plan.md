# Plano de Implementação: TarifaZero (Estado Final da Sessão)

Este documento consolida o que foi feito e o que falta para a próxima sessão.

## 1. O que foi implementado
- **Sistema de Update v2.4.1**: Configurado para buscar `https://tarifazero.vercel.app/version.json`.
- **Busca de Rota com Inteligência**: Autocomplete limitado a Palmas/PR (bbox e coordenadas de fallback).
- **GlobalMenu**: Ícone de perfil no canto superior direito (`App.tsx`) que abre a gaveta de perfil e permite fechar o app.
- **Automação de Release**: Criado `release.bat` que faz (Build -> Sync -> APK Debug -> Copy to Public -> Git Commit).

## 2. Bloqueio Atual: APK não reflete as mudanças
O usuário relatou que o APK gerado (`v2.4.1`) parece não conter as mudanças visuais (GlobalMenu).

### Fatos verificados:
- O tamanho do APK saltou de **10MB** para **30MB** após a inclusão do Photon e do GlobalMenu, o que indica que o binário *foi* alterado.
- O `index.html` dentro dos assets do Android foi atualizado hoje às **02:38**.
- O commit do git foi realizado com sucesso via `.bat`.

### Possíveis Causas:
- **Cache do Navegador/Capacitor**: O app pode estar servindo uma versão em cache se o `webDir` não foi limpo.
- **Instalação do APK Antigo**: O usuário pode estar instalando o APK da raiz (`c:\projetos\tarifaZero\TarifaZero.apk`) enquanto o Android Studio/Gradle pode estar gerando o `debug` em outra pasta se o script de cópia falhou silenciosamente (embora o log diga que copiou).
- **Z-Index do GlobalMenu**: O menu pode estar "atrás" de algum outro componente (embora tenha `z-50`).

## 3. Próximos Passos (Para o próximo "Eu")
1. **Verificar Renderização**: Abrir o log do Android (Logcat) para ver se há erros de carregamento no `GlobalMenu`.
2. **Limpeza de Build**: Rodar `./gradlew clean` na pasta `android` antes de um novo release para garantir binários frescos.
3. **Teste de Autocomplete**: Digitar ruas em Palmas para confirmar se o `bbox` em `BuscarRota.tsx` está filtrando corretamente.

## 4. Notas de Contexto
- O domínio oficial é `https://tarifazero.vercel.app`.
- O script de release é `.\release.bat "mensagem"`.

## 5. daqui pra baixo eu copiei e colei do session briefing, que teoricamente deveira ter sido implementado, por isso quero que verifique.:
# Briefing de Retomada: TarifaZero (Sessão 03/04/2026)

## 📌 Status Atual
Estamos na **v2.4.1**. O foco foi a implementação de busca de rotas e o sistema de auto-atualização por APK hospedado na Vercel.

## 🛠️ Arquivos Modificados
- `src/App.tsx`: Injetado `GlobalMenu` como componente root.
- `src/components/GlobalMenu.tsx` [NOVO]: Centraliza Perfil, ID Anônimo e Botão de Sair em todas as telas.
- `src/pages/BuscarRota.tsx`: Implementado Autocomplete (Photon API) com bounding-box travado em Palmas-PR.
- `src/pages/Sobre.tsx`: Limpeza de componentes redundantes (Perfil/Logout).
- `public/version.json`: Atualizado para v2.4.1 (versionCode 6).
- `android/app/build.gradle`: Atualizado para v2.4.1 (versionCode 6).
- `package.json`: Versão v2.4.1 e novos scripts (`release:apk`).
- `release.bat`: Script de automação total de build e commit.

## ⚠️ Bloqueador Crítico
**O APK gerado não parece mostrar as mudanças visuais para o usuário.**
- Hipótese: O `sync` do Capacitor pode estar copiando arquivos antigos ou o build do Android não está re-compilando o `index.html` modificado.
- O tamanho do APK subiu para **30MB**, o que prova que o binário é novo, mas a UI não mudou.

## 🚀 Próximos Passos Recomendados
1. Limpar cache do Android: `cd android && ./gradlew clean`.
2. Verificar se o `GlobalMenu` não está sendo ocultado por algum CSS Global ou Error Boundary.
3. Validar de novo o `public/TarifaZero.apk` após o `Push` no Vercel.
4. Investigar o uso de `dist/` vs `public/` no Capacitor.

-- *Contexto salvo para a próxima sessão.*
