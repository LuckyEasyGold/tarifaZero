# 📚 Tarifa Zero - Documentação Completa

**Versão**: 2.1.0  
**Data**: 30/03/2026  
**Desenvolvedor**: Vinícius Ribeiro Ramos  
**Email**: viniciusribramos@gmail.com  
**WhatsApp**: (42) 99106-6464  
**Localização**: Palmas - PR, Brasil

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Banco de Dados](#banco-de-dados)
6. [API Endpoints](#api-endpoints)
7. [Funcionalidades](#funcionalidades)
8. [Sistema de Versionamento](#sistema-de-versionamento)
9. [Deploy e CI/CD](#deploy-e-cicd)
10. [Contribuindo](#contribuindo)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

### O Que É o Tarifa Zero?

Sistema colaborativo de rastreamento de transporte público em tempo real que utiliza **crowdsourcing** para mapear rotas e posições dos veículos. Desenvolvido para Palmas-PR, permite que usuários contribuam com dados GPS enquanto estão no ônibus, criando um mapa colaborativo e preciso.

### Problema Resolvido

- ❌ Falta de informações em tempo real sobre transporte público
- ❌ Ausência de acesso oficial ao GPS dos veículos
- ❌ Necessidade de mapear rotas de forma colaborativa
- ❌ Dificuldade em validar que usuários estão realmente no ônibus

### Solução Implementada

- ✅ App nativo Android com scanner de WiFi
- ✅ Sistema de crowdsourcing com gamificação
- ✅ Validação por WiFi do ônibus (BSSID)
- ✅ Validação por trajeto (comparação com rotas já gravadas)
- ✅ Mapeamento colaborativo de rotas
- ✅ Visualização em tempo real no mapa
- ✅ Sistema de doações e apoiadores
- ✅ Notificação automática de atualizações

### Fluxo de Contribuição (Detalhado)

```
1. Usuário entra na tela "Contribuir"
   ↓
2. Seleciona a linha que está
   ↓
3. WiFi escaneia automaticamente (se disponível)
   ↓
4. Usuário escolhe o WiFi do ônibus (ou continua sem WiFi)
   ↓
5. BSSID é validado contra banco de dados
   ↓
6. Usuário clica em "Iniciar Criação de Rota"
   ↓
7. Sistema pede permissão de GPS
   ↓
8. Sistema inicia sessão no backend
   ↓
9. Usuário é redirecionado para mapa em modo gravação
   ↓
10. Durante a viagem:
    - App coleta GPS em tempo real
    - Usuário marca pontos de parada
    - Dados são enviados para /api/tracking/submit
   ↓
11. Ao finalizar:
    - Validação por trajeto compara com rota da linha
    - Confiança calculada baseada na proximidade
    - Rota salva com status: validada ou não validada
```

### Tipos de Validação

**Validação Oficial (WiFi):**
- BSSID do ônibus cadastrado no banco
- Confiança: 100%
- Rota aparece no ranking com badge "Validado"

**Validação por Trajeto:**
- Comparação do deslocamento com rota da linha
- Confiança calculada baseada na proximidade média
- Se ≥50% de confiança, rota é considerada válida

**Modo Sem Validação:**
- Usuário optou por continuar sem WiFi
- Confiança: <50%
- Rota é salva mas não aparece no ranking oficial


---

## 🏗️ ARQUITETURA

### Stack Tecnológico Completo

**Frontend**:
- React 18 + TypeScript
- Vite 7 (build tool)
- Tailwind CSS + Radix UI
- React Router DOM v7
- Leaflet + React-Leaflet
- Capacitor 8 (app nativo)
- Sonner (toast notifications)

**Backend**:
- Node.js (Vercel Serverless Functions)
- Prisma ORM 5
- PostgreSQL + PostGIS (Neon)
- API consolidada (1 função para evitar limite)

**Mobile**:
- Capacitor 8
- Plugin customizado: WifiScannerPlugin.java
- Android 13+ support
- Java 17 + Gradle 8

**DevOps**:
- Vercel (hosting frontend + API)
- GitHub Actions (CI/CD automático)
- Neon (PostgreSQL serverless)
- Git + GitHub

### Fluxo de Dados

```
Usuário (App Android)
    ↓
Scanner WiFi → Valida ônibus
    ↓
GPS Tracking → Coleta pontos
    ↓
API (/api/tracking/submit)
    ↓
PostgreSQL + PostGIS
    ↓
Processamento e Agregação
    ↓
Visualização no Mapa (tempo real)
```

