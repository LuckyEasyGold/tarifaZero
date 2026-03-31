# Script de Merge - Passo a Passo

## ⚠️ IMPORTANTE: Leia antes de executar!

O colaborador fez mudanças EXCELENTES no WiFi Scanner para Android 13+.
Suas mudanças de UX também são valiosas.
Vamos combinar o melhor dos dois mundos!

---

## 🎯 Estratégia de Merge

### Fase 1: Backup e Preparação

```bash
# 1. Criar branch de backup
git branch backup-local-$(date +%Y%m%d)

# 2. Ver o que você tem localmente
git status

# 3. Fazer stash das mudanças locais
git stash save "Minhas melhorias: logs, APK name, UX indicators"
```

### Fase 2: Puxar Mudanças do Remoto

```bash
# 4. Puxar mudanças do remoto
git pull origin main

# 5. Verificar se deu certo
git log --oneline -10
```

### Fase 3: Aplicar Suas Mudanças

```bash
# 6. Aplicar suas mudanças de volta
git stash pop
```

### Fase 4: Resolver Conflitos (se houver)

Se houver conflitos no `WifiScannerPlugin.java`:

1. Abrir o arquivo no editor
2. Procurar por marcadores: `<<<<<<<`, `=======`, `>>>>>>>`
3. Manter o código do remoto (Android 13+ support)
4. Adicionar seus logs no código do remoto

**Exemplo de como deve ficar**:

```java
@PluginMethod
public void scan(PluginCall call) {
    android.util.Log.d("WifiScanner", "scan() chamado"); // SEU LOG
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        android.util.Log.d("WifiScanner", "Android 13+ detectado"); // SEU LOG
        // Código do remoto (Android 13+)
        if (getPermissionState("nearbyWifi") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("nearbyWifi", call, "permissionsCallback");
            return;
        }
    } else {
        android.util.Log.d("WifiScanner", "Android < 13 detectado"); // SEU LOG
        // Código do remoto (Android < 13)
        if (getPermissionState("location") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "permissionsCallback");
            return;
        }
    }

    performScan(call);
}
```

### Fase 5: Testar

```bash
# 7. Compilar APK
cd android
./gradlew assembleDebug

# 8. Verificar se APK foi gerado com nome correto
ls -lh app/build/outputs/apk/debug/TarifaZero.apk

# 9. Copiar APK
cd ..
cp android/app/build/outputs/apk/debug/TarifaZero.apk .
cp android/app/build/outputs/apk/debug/TarifaZero.apk public/
```

### Fase 6: Commit Final

```bash
# 10. Adicionar arquivos
git add .

# 11. Commit
git commit -m "merge: combina melhorias locais (logs, UX) com fixes do remoto (Android 13+)

- Mantém suporte Android 13+ do colaborador (NEARBY_WIFI_DEVICES)
- Adiciona logs detalhados para debug
- Mantém nome do APK (TarifaZero.apk)
- Mantém indicador visual de scan
- Mantém mensagens de erro específicas
- Inclui nova página Sobre e tabela Supporters"

# 12. Push
git push origin main
```

---

## 🔍 Checklist de Verificação

Antes de fazer push, verificar:

- [ ] APK compila sem erros
- [ ] Nome do APK é "TarifaZero.apk"
- [ ] Página Sobre abre sem erros
- [ ] Endpoint /api/supporters responde
- [ ] TypeScript sem erros de tipo
- [ ] Logs aparecem no logcat
- [ ] Indicador visual de scan funciona

---

## 🆘 Se Algo Der Errado

### Voltar ao estado anterior:

```bash
# Cancelar merge
git merge --abort

# OU restaurar do backup
git reset --hard backup-local-$(date +%Y%m%d)
```

### Pedir ajuda:

```bash
# Ver status
git status

# Ver conflitos
git diff

# Ver log
git log --oneline --graph --all -20
```

---

## 💡 Dicas

1. **Não tenha pressa** - Leia os conflitos com calma
2. **Teste antes de commitar** - Compile o APK e teste
3. **Faça backup** - O branch de backup está lá se precisar
4. **Comunique-se** - Avise o colaborador sobre o merge

---

## 📞 Comandos Úteis Durante o Merge

```bash
# Ver diferenças entre local e remoto
git diff HEAD origin/main

# Ver apenas nomes dos arquivos diferentes
git diff HEAD origin/main --name-only

# Ver log do remoto
git log origin/main --oneline -10

# Ver suas mudanças em stash
git stash show -p

# Listar todos os stashes
git stash list
```

---

## ✅ Resultado Esperado

Após o merge bem-sucedido, você terá:

1. ✅ Suporte completo para Android 13+ (do colaborador)
2. ✅ Logs detalhados para debug (seu)
3. ✅ Nome do APK correto (seu)
4. ✅ Indicador visual de scan (seu)
5. ✅ Mensagens de erro específicas (seu)
6. ✅ Página Sobre funcionando (do colaborador)
7. ✅ Sistema de apoiadores (do colaborador)
8. ✅ Correções de tipo TypeScript (do colaborador)

**O melhor dos dois mundos! 🎉**
