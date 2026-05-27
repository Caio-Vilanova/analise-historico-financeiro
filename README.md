# Finanálise

Sistema de análise financeira histórica utilizando paralelismo, multiprocessamento e manipulação de grandes volumes de dados.

---

## 📌 Sobre o Projeto

O **Finanálise** é uma aplicação desenvolvida com foco em processamento paralelo e análise de dados financeiros históricos em larga escala.

O sistema utiliza datasets públicos contendo milhões de registros financeiros para realizar comparações históricas, benchmarks de desempenho e análises estatísticas utilizando múltiplos núcleos do processador.

---

## 🎯 Objetivo

O objetivo do projeto é demonstrar na prática conceitos de:

- Paralelismo
- Multiprocessamento
- Concorrência
- Big Data
- Processamento distribuído
- Benchmark computacional

---

## 🚀 Funcionalidades

- Comparação de ativos financeiros
- Análise histórica de ações
- Processamento paralelo de datasets
- Benchmark entre execução sequencial e paralela
- Manipulação de grandes volumes de dados
- Geração de estatísticas financeiras
- Visualização gráfica de resultados

---

## 🛠️ Tecnologias Utilizadas

### Linguagem
- Python 3.12+

### Bibliotecas
- Pandas
- NumPy
- Matplotlib
- Multiprocessing
- Concurrent Futures
- PySpark

### Banco de Dados
- PostgreSQL
- MongoDB

### Infraestrutura
- Docker
- Apache Spark

---

## 📂 Estrutura do Projeto

```bash
Finanalise/
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── external/
│
├── src/
│   ├── parallel/
│   ├── analytics/
│   ├── benchmarks/
│   ├── database/
│   └── visualization/
│
├── notebooks/
│
├── tests/
│
├── docker/
│
├── requirements.txt
│
├── README.md
│
└── main.py
```

---

## 📊 Bases de Dados

### Huge Stock Market Dataset
Dataset contendo milhões de registros históricos de ações e ETFs.

https://www.kaggle.com/datasets/borismarjanovic/price-volume-data-for-all-us-stocks-etfs

---

### Crypto Historical Dataset
Dataset histórico de criptomoedas.

https://www.kaggle.com/datasets/mczielinski/bitcoin-historical-data

---

### Banco Central do Brasil
Indicadores econômicos oficiais.

https://dadosabertos.bcb.gov.br/

---

## 💾 Volume de Dados

O sistema foi projetado para manipular:

- Mais de 8GB de dados
- Milhões de registros financeiros
- Dados históricos em larga escala

---

## ⚡ Paralelismo

O processamento é dividido entre múltiplos processos independentes.

### Exemplo

| Processo | Responsabilidade |
|----------|------------------|
| Processo 1 | Ações |
| Processo 2 | ETFs |
| Processo 3 | Criptomoedas |
| Processo 4 | Indicadores econômicos |

---

## 📈 Benchmark de Performance

O sistema realiza comparação entre:

- Execução sequencial
- Execução paralela
- Uso de CPU
- Tempo de processamento

### Exemplo esperado

| Método | Tempo |
|--------|--------|
| Sequencial | 18s |
| Paralelo | 4s |

---

## ▶️ Como Executar

### Clone o repositório

```bash
git clone https://github.com/seuusuario/finanalise.git
```

---

### Entre na pasta do projeto

```bash
cd finanalise
```

---

### Instale as dependências

```bash
pip install -r requirements.txt
```

---

### Execute o projeto

```bash
python main.py
```

---

## 📋 Requisitos

- Python 3.12+
- Processador multi-core
- 8GB RAM ou superior
- Espaço em disco para datasets massivos

---

## 📚 Conceitos Aplicados

- Concorrência
- Paralelismo
- Multiprocessamento
- Big Data
- Processamento distribuído
- Análise financeira histórica

---

## 🔮 Melhorias Futuras

- Dashboard em tempo real
- Machine Learning financeiro
- Previsão de mercado
- Integração com APIs financeiras
- Processamento distribuído em cluster

---

## 👨‍💻 Autores
Caio Vinícius da Silva Vilanova 83420



## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos e educacionais.
