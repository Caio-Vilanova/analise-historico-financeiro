# Análise Financeira Paralela com Multiprocessing em Python

**Disciplina:** Programação Concorrente e Distribuída  
**Turma:** ADSN04  
**Professor:** Rafael  
**Alunos:** Caio Vinicius da Silva Vilanova 83420 e Matheus Nery Walkowicz 077651


**Data:** 01/06/2026  

---

## 1. Descrição do Problema

O projeto foi desenvolvido para processar uma grande base de dados financeiros históricos em formato CSV, comparando o desempenho da execução sequencial com a execução paralela utilizando múltiplos processos.

Os dados utilizados foram obtidos através do Kaggle e contêm informações históricas do mercado financeiro. O objetivo é demonstrar os ganhos de desempenho proporcionados pelo paralelismo durante o processamento de grandes volumes de dados.

| Pergunta | Resposta |
|----------|----------|
| Objetivo | Comparar processamento sequencial e paralelo em uma base financeira de grande volume |
| Volume de dados | **34.906.486 registros processados** |
| Fonte dos dados | Dataset financeiro do Kaggle |
| Algoritmo | Leitura e processamento de arquivos CSV utilizando Multiprocessing |
| Complexidade | O(N/p), onde N representa o número de registros e p o número de processos |

---

## 2. Ambiente Experimental

| Item | Descrição |
|------|-----------|
| Processador | Intel Xeon E5-2640 v3 |
| Número de núcleos | 8 núcleos físicos / 16 threads lógicas |
| Memória RAM | 16 GB |
| Sistema Operacional | Windows 11 64 bits |
| Linguagem utilizada | Python 3.14 |
| Biblioteca de paralelização | multiprocessing |
| Monitoramento | psutil |
| Ambiente de desenvolvimento | Visual Studio Code |

---

## 3. Metodologia de Testes

O tempo foi medido utilizando a biblioteca `time.perf_counter()`, contabilizando o tempo total necessário para processar todos os registros do dataset.

A versão sequencial realiza a leitura completa dos arquivos utilizando apenas um processo.

A versão paralela divide os arquivos entre múltiplos processos utilizando a biblioteca `multiprocessing`, permitindo que diferentes partes dos dados sejam processadas simultaneamente.

Durante os testes também foram coletadas métricas de utilização de CPU e memória RAM através da biblioteca `psutil`.

### Configurações testadas

- Execução Sequencial (Baseline)
- 2 processos
- 4 processos
- 8 processos
- 16 processos

---

## 4. Resultados Experimentais

### Teste com 2 Processos

| Métrica | Resultado |
|----------|----------:|
| Registros Processados | 34.906.486 |
| Tempo Serial | 75,96 s |
| Tempo Paralelo | 39,71 s |
| Speedup | 1,91x |
| CPU Média | 10,91% |
| CPU Máxima | 18,9% |
| RAM Utilizada | 11,46 GB |

---

### Teste com 4 Processos

| Métrica | Resultado |
|----------|----------:|
| Registros Processados | 34.906.486 |
| Tempo Serial | 75,24 s |
| Tempo Paralelo | 21,78 s |
| Speedup | 3,46x |
| CPU Média | 13,01% |
| CPU Máxima | 30,7% |
| RAM Utilizada | 11,50 GB |

---

### Teste com 8 Processos

| Métrica | Resultado |
|----------|----------:|
| Registros Processados | 34.906.486 |
| Tempo Serial | 74,79 s |
| Tempo Paralelo | 13,72 s |
| Speedup | 5,45x |
| CPU Média | 16,89% |
| CPU Máxima | 66,5% |
| RAM Utilizada | 11,27 GB |

---

### Teste com 16 Processos

| Métrica | Resultado |
|----------|----------:|
| Registros Processados | 34.906.486 |
| Tempo Serial | 93,45 s |
| Tempo Paralelo | 12,46 s |
| Speedup | 7,50x |
| CPU Média | 15,40% |
| CPU Máxima | 100,0% |
| RAM Utilizada | 11,55 GB |

---

## 5. Cálculo de Speedup e Eficiência

O speedup mede quantas vezes a execução paralela foi mais rápida em relação à execução sequencial.

```text
Speedup(p) = T_sequencial / T_paralelo
```

A eficiência mede o aproveitamento médio dos processos utilizados.

```text
Eficiência(p) = Speedup(p) / p × 100%
```

---

## 6. Tabela de Resultados

| Processos | Tempo Paralelo (s) | Speedup | Eficiência |
|:---------:|:------------------:|:-------:|:----------:|
| 2 | 39,71 | 1,91x | 95,5% |
| 4 | 21,78 | 3,46x | 86,5% |
| 8 | 13,72 | 5,45x | 68,1% |
| 16 | 12,46 | 7,50x | 46,9% |

> **Melhor resultado: 16 processos — 12,46 segundos — speedup de 7,50x**

---

## 7. Análise dos Resultados

Os resultados demonstram ganhos significativos de desempenho conforme o número de processos aumenta.

Utilizando apenas 2 processos, o tempo de execução caiu de aproximadamente 76 segundos para 40 segundos.

Com 4 processos, o tempo foi reduzido para cerca de 22 segundos, mantendo alta eficiência.

O melhor resultado foi obtido utilizando 16 processos, alcançando um tempo de apenas 12,46 segundos e speedup de 7,50 vezes em relação à execução sequencial.

Durante os testes foi possível observar que a utilização máxima da CPU atingiu 100%, demonstrando que o sistema conseguiu explorar totalmente os recursos disponíveis do processador.

O consumo de memória permaneceu estável em aproximadamente 11,5 GB durante todas as execuções, permitindo processar quase 35 milhões de registros sem esgotar os recursos do sistema.

### Principais fatores limitantes

- Leitura de grandes volumes de arquivos CSV
- Operações de entrada e saída (I/O)
- Sobrecarga de criação e gerenciamento de processos
- Comunicação entre processos
- Limitações impostas pela Lei de Amdahl

---

## 8. Conclusão

O uso de paralelismo com a biblioteca `multiprocessing` apresentou ganhos expressivos no processamento da base financeira analisada.

O tempo de execução foi reduzido de aproximadamente 76 segundos para apenas 12,46 segundos utilizando 16 processos, representando um speedup de 7,50 vezes.

Os experimentos demonstram que aplicações voltadas para processamento de grandes volumes de dados em formato CSV podem se beneficiar significativamente do processamento paralelo.

Além dos ganhos de desempenho, o projeto permitiu avaliar métricas importantes como utilização de CPU, consumo de memória, speedup e eficiência, fornecendo uma visão prática dos conceitos estudados na disciplina de Programação Concorrente e Distribuída.

---

## Dataset Utilizado

Dataset financeiro obtido através do Kaggle:

- Histórico de ações e ETFs
- Milhares de arquivos CSV
- Aproximadamente 35 milhões de registros processados

---

## Bibliotecas Utilizadas

```bash
multiprocessing
psutil
time
os
```

---

## Como Executar

```bash
python main.py
```

---
