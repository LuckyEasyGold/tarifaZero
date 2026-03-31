# 🔨 Como Gerar APK Localmente

## 🎯 Problema Resolvido

O `gradle.properties` não pode ter caminhos específicos do Windows porque o GitHub Actions roda em Linux. Esta solução permite buildar localmente E no GitHub Actions.

---

## ✅ Solução: Melhor dos Dois Mundos

### Windows (Local)
Usa `gradle.properties.local` (não commitado)

### Linux (GitHub Actions)
Usa `gradle.properties` (sem caminhos específicos)

---

## 🚀 Como Usar

### 1. Executar Script

```powershell
.\build-apk.ps1
```

O script faz automaticamente:
1. ✅ Aplica configuração local do Java
2. ✅ Gera Prisma Client
3. ✅ Build do frontend
4. ✅ Sincroniza Capacitor
5. ✅ Compila APK com Gradle
6. ✅ Copia APK para `public/`
7. ✅ Restaura configuração original

### 2. Testar APK

Instalar no celular e testar todas as funcionalidades.

### 3. Commitar APK

```powershell
git add public/TarifaZero.apk
git commit -m "chore: atualiza APK v2.2.0"
git push origin main
```

---

## 📁 Arquivos Envolvidos

### `android/gradle.properties` (Commitado)
```properties
# Sem configuração de Java
# Funciona no GitHub Actions (Linux)
android.useAndroidX=true
```

### `android/gradle.properties.local` (NÃO Commitado)
```properties
# Configuração específica do Windows
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.18.8-hotspot
```

### `build-apk.ps1` (Script)
- Aplica configuração local temporariamente
- Compila APK
- Restaura configuração original

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  WINDOWS (Local)                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Executar: .\build-apk.ps1                               │
│     ↓                                                        │
│  2. Script aplica gradle.properties.local                   │
│     ├─ Adiciona: org.gradle.java.home=C:\...               │
│     └─ Temporariamente                                      │
│     ↓                                                        │
│  3. Gradle usa Java 17 do Windows                           │
│     ↓                                                        │
│  4. APK compilado com sucesso                               │
│     ↓                                                        │
│  5. Script restaura gradle.properties original              │
│     └─ Remove configuração local                            │
│     ↓                                                        │
│  6. Commitar: git add public/TarifaZero.apk                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
                    git push origin main
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LINUX (GitHub Actions)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. GitHub Actions detecta push                             │
│     ↓                                                        │
│  2. Setup Java 17 (via workflow)                            │
│     ├─ uses: actions/setup-java@v4                          │
│     └─ java-version: '17'                                   │
│     ↓                                                        │
│  3. Gradle usa Java 17 do Actions                           │
│     └─ Ignora gradle.properties (sem config local)          │
│     ↓                                                        │
│  4. APK compilado com sucesso                               │
│     ↓                                                        │
│  5. Upload como artifact                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

### NÃO Commitar
- ❌ `android/gradle.properties.local`
- ❌ `android/gradle.properties.backup`
- ❌ `android/local.properties`

Esses arquivos estão no `.gitignore`.

### Commitar
- ✅ `android/gradle.properties` (sem config local)
- ✅ `public/TarifaZero.apk` (APK gerado)
- ✅ `build-apk.ps1` (script)

---

## 🐛 Troubleshooting

### Erro: "Java home supplied is invalid"

**Causa**: `gradle.properties.local` não existe ou caminho incorreto.

**Solução**:
1. Verificar se Java 17 está instalado:
   ```powershell
   java -version
   ```
2. Criar `android/gradle.properties.local`:
   ```properties
   org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.18.8-hotspot
   ```
3. Ajustar caminho se necessário

### Erro: "Gradle build failed"

**Causa**: Configuração local não foi aplicada.

**Solução**:
1. Executar script completo: `.\build-apk.ps1`
2. Não executar `gradlew` diretamente

---

## 📊 Comparação

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Build Local | ❌ Precisa editar gradle.properties | ✅ Script automático |
| GitHub Actions | ❌ Falha (caminho Windows) | ✅ Funciona (sem config) |
| Commitar | ❌ Conflito de configuração | ✅ Sem conflito |
| Manutenção | ❌ Manual | ✅ Automática |

---

**Última Atualização**: 31/03/2026  
**Versão**: 2.2.0
