# Análise Financeira Paralela

**Disciplina:** Programação Concorrente e Distribuída
**Turma:** ADSN04
**Professor:** Rafael
**Alunos:** Caio Vinicius da Silva Vilanova 83420 e Matheus Nery Walkowicz 077651

**Data:** 01/06/2026

---

## 1. Descrição do Problema

O projeto foi desenvolvido para processar uma grande base de dados financeiros históricos em formato CSV, comparando o desempenho da execução sequencial com a execução paralela utilizando múltiplos processos.

Os dados utilizados foram obtidos através do Kaggle e contêm informações históricas do mercado financeiro. O objetivo é demonstrar os ganhos de desempenho proporcionados pelo paralelismo durante o processamento de grandes volumes de dados.

| Pergunta        | Resposta                                                                             |
| --------------- | ------------------------------------------------------------------------------------ |
| Objetivo        | Comparar processamento sequencial e paralelo em uma base financeira de grande volume |
| Volume de dados | **34.906.486 registros processados**                                                 |
| Fonte dos dados | Dataset financeiro do Kaggle                                                          |
| Algoritmo       | Leitura e processamento de arquivos CSV utilizando Multiprocessing                   |
| Complexidade    | O(N/p), onde N representa o número de registros e p o número de processos             |

---

## 2. Ambiente Experimental

| Item                        | Descrição                              |
| --------------------------- | -------------------------------------- |
| Processador                 | Intel Xeon E5-2640 v3                  |
| Número de núcleos           | 8 núcleos físicos / 16 threads lógicas |
| Memória RAM                 | 16 GB                                  |
| Sistema Operacional         | Windows 11 64 bits                     |
| Linguagem utilizada         | Python 3.14                            |
| Biblioteca de paralelização | multiprocessing                        |
| Monitoramento               | psutil                                 |
| Ambiente de desenvolvimento | Visual Studio Code                     |

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
- 12 processos

---

## 4. Resultados Experimentais

| Processos | Registros Processados | Tempo Serial (s) | Tempo Paralelo (s) | Speedup | CPU Média | CPU Máxima | RAM Utilizada |
| --------- | --------------------- | ---------------- | ------------------ | ------- | --------- | ---------- | ------------- |
| 2         | 34.906.486            | 75,96            | 39,71              | 1,91x   | 10,91%    | 18,9%      | 11,46 GB      |
| 4         | 34.906.486            | 75,24            | 21,78              | 3,46x   | 13,01%    | 30,7%      | 11,50 GB      |
| 8         | 34.906.486            | 74,79            | 13,72              | 5,45x   | 16,89%    | 66,5%      | 11,27 GB      |
| 12        | 34.906.486            | 93,45            | 12,46              | 7,50x   | 15,40%    | 100,0%     | 11,55 GB      |

### Tempo de Execução: Serial x Paralelo

![Tempo de Execução: Serial x Paralelo](imagens/grafico3.png)

### Interpretação dos Resultados

Observa-se uma redução significativa do tempo de execução a partir de 8 processos. Isso ocorre porque a carga de trabalho passa a ser distribuída de forma mais eficiente entre os núcleos do processador. Como os arquivos CSV podem ser processados independentemente, múltiplos processos conseguem trabalhar simultaneamente sobre diferentes partes dos dados, reduzindo o tempo total necessário para concluir a tarefa.

Apesar do ganho de desempenho, o aumento do número de processos não gera uma redução proporcional do tempo, pois fatores como leitura de disco (I/O), gerenciamento dos processos e limitações de hardware passam a influenciar os resultados.

---

## 5. Cálculo de Speedup e Eficiência

O speedup mede quantas vezes a execução paralela foi mais rápida em relação à execução sequencial.

```
Speedup(p) = T_sequencial / T_paralelo
```

A eficiência mede o aproveitamento médio dos processos utilizados.

```
Eficiência(p) = Speedup(p) / p × 100%
```

### Speedup x Nº de Processos

![Speedup x Nº de Processos](imagens/grafico1.png)

### Eficiência x Nº de Processos

![Eficiência x Nº de Processos](imagens/grafico2.png)

---

## 6. Análise dos Resultados

Os resultados demonstram ganhos significativos de desempenho conforme o número de processos aumenta.

Utilizando apenas 2 processos, o tempo de execução caiu de aproximadamente 76 segundos para 40 segundos.

Com 4 processos, o tempo foi reduzido para cerca de 22 segundos, mantendo alta eficiência.

O melhor resultado foi obtido utilizando 12 processos, alcançando um tempo de apenas 12,46 segundos e speedup de 7,50 vezes em relação à execução sequencial.

Durante os testes foi possível observar que a utilização máxima da CPU atingiu 100%, demonstrando que o sistema conseguiu explorar totalmente os recursos disponíveis do processador.

O consumo de memória permaneceu estável em aproximadamente 11,5 GB durante todas as execuções, permitindo processar quase 35 milhões de registros sem esgotar os recursos do sistema.

### Principais fatores limitantes

- Leitura de grandes volumes de arquivos CSV
- Operações de entrada e saída (I/O)
- Sobrecarga de criação e gerenciamento de processos
- Comunicação entre processos
- Limitações impostas pela Lei de Amdahl

---

## 7. Conclusão

O uso de paralelismo com a biblioteca `multiprocessing` apresentou ganhos expressivos no processamento da base financeira analisada.

O tempo de execução foi reduzido de aproximadamente 76 segundos para apenas 12,46 segundos utilizando 12 processos, representando um speedup de 7,50 vezes.

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

```
multiprocessing
psutil
time
os
```

---

## Como Executar

```
python main.py
```
