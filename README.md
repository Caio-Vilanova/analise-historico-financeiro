# FinScan

Pipeline de análise de risco de portfólio financeiro (B3 + Crypto), desenvolvido como trabalho acadêmico para a disciplina de **Computação Paralela e Distribuída** — Unieuro, 2025.

O objetivo central é medir o tempo de execução serial de cada etapa do pipeline e, na Fase 2, paralelizar as etapas identificadas como gargalo, calculando o speedup real obtido.

---

## Estrutura do projeto

```
finscan/
├── pipeline_serial.py       # Fase 1 — execução serializada + registro de tempo
├── pipeline_parallel.py     # Fase 2 — versão paralelizada (a implementar)
├── benchmarks/
│   └── benchmark_serial.json
├── reports/
│   └── report_serial.json
├── data/                    # CSVs ou cache local de preços
└── README.md
```

---

## Pipeline — 5 etapas

```
[fetch] → [compute_metrics] → [correlation] → [portfolio_risk] → [report]
```

| # | Etapa | Tipo | Descrição |
|---|---|---|---|
| 1 | `fetch` | I/O bound | Coleta de histórico de preços por ativo |
| 2 | `compute_metrics` | CPU bound | Retorno, volatilidade, Sharpe, VaR, CVaR, drawdown, beta |
| 3 | `correlation` | CPU bound | Matriz de correlação n×n entre ativos |
| 4 | `portfolio_risk` | CPU bound | Risco agregado via σ²_p = w'Σw |
| 5 | `report` | I/O bound | Geração do relatório JSON com benchmark |

---

## Ativos analisados

**B3:** PETR4, VALE3, ITUB4, BBDC4, MGLU3

**Crypto:** BTC-USD, ETH-USD, BNB-USD, SOL-USD, ADA-USD

---

## Métricas calculadas por ativo

- Retorno acumulado e anualizado
- Volatilidade anualizada (desvio padrão dos retornos diários × √252)
- Sharpe Ratio — `(r - rf) / σ`, com rf = SELIC 10,75%
- Max Drawdown — maior queda pico → vale
- Value at Risk 95% (VaR) — percentil 5% dos retornos × valor alocado
- CVaR / Expected Shortfall — média das perdas além do VaR
- Beta — covariância com benchmark / variância do benchmark

---

## Resultado do baseline serial

```
============================================================
  REGISTRO DE TEMPO SERIAL
============================================================
  Etapa                  Tempo (s)   % total  Tipo
  --------------------------------------------------------
  fetch                    3.0042     79.4%   I/O bound
  compute_metrics          0.7011     18.5%   CPU bound
  correlation              0.0775      2.0%   CPU bound
  portfolio_risk           0.0001      0.0%   CPU bound
  report                   0.0003      0.0%   I/O bound
  --------------------------------------------------------
  TOTAL SERIAL             3.7835    100.0%
============================================================

  Baseline registrado: 3.7835s
  Gargalo principal : fetch (79.4% do tempo)
  Etapas paralelizáveis: fetch (asyncio), compute_metrics (multiprocessing)
```

---

## Como executar

**Requisitos:** Python 3.10+ (apenas biblioteca padrão — sem dependências externas)

```bash
python pipeline_serial.py
```

---

## Fase 2 — Paralelização planejada

| Etapa | Estratégia | Speedup esperado |
|---|---|---|
| `fetch` | `asyncio` + `aiohttp` — requisições concorrentes | ~8–10× |
| `compute_metrics` | `multiprocessing.Pool.map` — um processo por ativo | ~n_cores× |
| `correlation` | `concurrent.futures` — paralelização por linha da matriz | ~2–4× |

Speedup total estimado (Lei de Amdahl, 8 cores): **~5–7×**

---

## Integrações com APIs públicas

A etapa `fetch` foi implementada com dados sintéticos (GBM) para rodar sem dependências. Abaixo estão as APIs públicas reais que podem substituir o gerador, com zero custo.

### Yahoo Finance — `yfinance`

API não oficial, mas amplamente utilizada. Cobre todos os ativos da B3 (sufixo `.SA`) e Crypto.

```python
import yfinance as yf

def fetch_yahoo(ticker: str, period: str = "1y") -> list[float]:
    df = yf.download(ticker, period=period, progress=False)
    return df["Close"].dropna().tolist()

# Exemplos de uso
fetch_yahoo("PETR4.SA")   # B3 — sufixo .SA obrigatório
fetch_yahoo("BTC-USD")    # Crypto
fetch_yahoo("^BVSP")      # IBOVESPA como benchmark
```

Instalar: `pip install yfinance`

---

### Alpha Vantage

API REST gratuita (25 req/dia no plano free). Boa para dados fundamentalistas além de preços.

```python
import requests

API_KEY = "sua_chave"  # gratuito em alphavantage.co

def fetch_alpha_vantage(symbol: str) -> list[float]:
    url = (
        f"https://www.alphavantage.co/query"
        f"?function=TIME_SERIES_DAILY_ADJUSTED"
        f"&symbol={symbol}&outputsize=full&apikey={API_KEY}"
    )
    data = requests.get(url).json()
    series = data.get("Time Series (Daily)", {})
    return [float(v["4. close"]) for v in series.values()]
```

Endpoint relevante para o projeto: `TIME_SERIES_DAILY_ADJUSTED` — já traz preços ajustados por dividendos e splits.

---

### Banco Central do Brasil (BCB) — SELIC e câmbio

API pública oficial do BCB, sem autenticação.

```python
import requests

def fetch_selic_atual() -> float:
    """Retorna a taxa SELIC meta anual mais recente."""
    url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
    data = requests.get(url).json()
    return float(data[0]["valor"]) / 100  # ex: 0.1075

def fetch_cambio_usd_brl() -> float:
    """Retorna a cotação USD/BRL mais recente."""
    url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"
    data = requests.get(url).json()
    return float(data[0]["valor"])
```

Séries úteis: `432` (SELIC meta), `1` (USD/BRL), `12` (CDI diário), `4389` (IPCA).

---

### CoinGecko — Crypto

API pública, 30 req/min sem autenticação.

```python
import requests

COIN_IDS = {
    "BTC-USD": "bitcoin",
    "ETH-USD": "ethereum",
    "BNB-USD": "binancecoin",
    "SOL-USD": "solana",
    "ADA-USD": "cardano",
}

def fetch_coingecko(coin_id: str, days: int = 365) -> list[float]:
    url = (
        f"https://api.coingecko.com/api/v3/coins/{coin_id}"
        f"/market_chart?vs_currency=brl&days={days}&interval=daily"
    )
    data = requests.get(url).json()
    return [p[1] for p in data["prices"]]  # [timestamp, price]
```

---

### Brapi.dev — B3 (Brasil)

API brasileira focada em B3, plano gratuito disponível.

```python
import requests

def fetch_brapi(ticker: str, range_: str = "1y") -> list[float]:
    url = f"https://brapi.dev/api/quote/{ticker}?range={range_}&interval=1d"
    data = requests.get(url).json()
    history = data["results"][0]["historicalDataPrice"]
    return [item["close"] for item in history if item.get("close")]
```

Documentação: `brapi.dev/docs`

---

## Integração com PostgreSQL

Para persistir resultados de múltiplas execuções, comparar versões serial vs paralela ao longo do tempo e construir histórico de benchmarks.

### Schema sugerido

```sql
-- Execuções do pipeline
CREATE TABLE execucoes (
    id          SERIAL PRIMARY KEY,
    modo        VARCHAR(10) NOT NULL,      -- 'serial' | 'parallel'
    iniciado_em TIMESTAMPTZ NOT NULL,
    total_seg   NUMERIC(10, 4) NOT NULL,
    n_ativos    INT NOT NULL,
    speedup     NUMERIC(6, 2)              -- NULL na serial, preenchido na paralela
);

-- Benchmark por etapa
CREATE TABLE benchmark_etapas (
    id           SERIAL PRIMARY KEY,
    execucao_id  INT REFERENCES execucoes(id) ON DELETE CASCADE,
    etapa        VARCHAR(30) NOT NULL,
    duracao_seg  NUMERIC(10, 4) NOT NULL,
    pct_total    NUMERIC(5, 2) NOT NULL,
    tipo_bound   VARCHAR(10) NOT NULL      -- 'I/O' | 'CPU'
);

-- Métricas por ativo
CREATE TABLE metricas_ativos (
    id                  SERIAL PRIMARY KEY,
    execucao_id         INT REFERENCES execucoes(id) ON DELETE CASCADE,
    ticker              VARCHAR(15) NOT NULL,
    retorno_total       NUMERIC(10, 2),
    retorno_anual       NUMERIC(10, 2),
    volatilidade        NUMERIC(10, 2),
    sharpe_ratio        NUMERIC(8, 4),
    max_drawdown        NUMERIC(10, 2),
    var_95              NUMERIC(12, 2),
    cvar_95             NUMERIC(12, 2),
    beta                NUMERIC(8, 4)
);

-- Risco do portfólio
CREATE TABLE portfolio_risco (
    id                  SERIAL PRIMARY KEY,
    execucao_id         INT REFERENCES execucoes(id) ON DELETE CASCADE,
    retorno_esperado    NUMERIC(10, 2),
    volatilidade        NUMERIC(10, 2),
    var_95_brl          NUMERIC(12, 2),
    n_ativos            INT
);
```

### Persistência em Python com `psycopg2`

```python
import psycopg2
import psycopg2.extras

DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "finscan",
    "user":     "finscan_user",
    "password": "sua_senha",
}

def salvar_execucao(resultado: dict, modo: str = "serial") -> int:
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Insere execução principal
    cur.execute(
        """INSERT INTO execucoes (modo, iniciado_em, total_seg, n_ativos)
           VALUES (%s, NOW(), %s, %s) RETURNING id""",
        (modo, resultado["total_sec"], len(resultado["metrics"]))
    )
    exec_id = cur.fetchone()[0]

    # Insere benchmark por etapa
    type_map = {
        "fetch": "I/O", "compute_metrics": "CPU",
        "correlation": "CPU", "portfolio_risk": "CPU", "report": "I/O"
    }
    total = resultado["total_sec"]
    for b in resultado["benchmarks"]:
        pct = round((b.duration_sec / total) * 100, 2)
        cur.execute(
            """INSERT INTO benchmark_etapas
               (execucao_id, etapa, duracao_seg, pct_total, tipo_bound)
               VALUES (%s, %s, %s, %s, %s)""",
            (exec_id, b.stage, b.duration_sec, pct, type_map.get(b.stage, "CPU"))
        )

    # Insere métricas por ativo
    for m in resultado["metrics"]:
        cur.execute(
            """INSERT INTO metricas_ativos
               (execucao_id, ticker, retorno_total, retorno_anual,
                volatilidade, sharpe_ratio, max_drawdown, var_95, cvar_95, beta)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (exec_id, m.ticker, m.total_return, m.annualized_return,
             m.volatility, m.sharpe_ratio, m.max_drawdown,
             m.var_95, m.cvar_95, m.beta)
        )

    # Insere risco do portfólio
    p = resultado["portfolio"]
    cur.execute(
        """INSERT INTO portfolio_risco
           (execucao_id, retorno_esperado, volatilidade, var_95_brl, n_ativos)
           VALUES (%s, %s, %s, %s, %s)""",
        (exec_id, p["portfolio_return_pct"],
         p["portfolio_volatility_pct"], p["portfolio_var_95_brl"], p["n_assets"])
    )

    conn.commit()
    cur.close()
    conn.close()
    return exec_id


def comparar_serial_paralelo() -> None:
    """Imprime comparativo de todas as execuções registradas."""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT modo, COUNT(*) as runs,
               AVG(total_seg) as media_seg,
               MIN(total_seg) as min_seg,
               MAX(speedup)   as max_speedup
        FROM execucoes
        GROUP BY modo ORDER BY modo
    """)
    for row in cur.fetchall():
        print(row)
    conn.close()
```

Instalar: `pip install psycopg2-binary`

### Subir PostgreSQL local com Docker

```bash
docker run -d \
  --name finscan-db \
  -e POSTGRES_DB=finscan \
  -e POSTGRES_USER=finscan_user \
  -e POSTGRES_PASSWORD=sua_senha \
  -p 5432:5432 \
  postgres:16
```

---

## Dependências opcionais

| Biblioteca | Uso | Instalar |
|---|---|---|
| `yfinance` | Dados reais B3 + Crypto via Yahoo Finance | `pip install yfinance` |
| `requests` | Alpha Vantage, BCB, CoinGecko, Brapi | `pip install requests` |
| `psycopg2-binary` | Persistência no PostgreSQL | `pip install psycopg2-binary` |
| `aiohttp` | Fetch assíncrono na Fase 2 | `pip install aiohttp` |

O núcleo do pipeline (`pipeline_serial.py`) roda com **zero dependências externas**.

---

## Referências

- Lei de Amdahl — fundamento teórico para o speedup esperado
- GBM (Geometric Brownian Motion) — modelo de precificação de ativos, base do Black-Scholes
- Value at Risk — Jorion, P. *Value at Risk*, 3ª ed.
- API BCB — `https://dadosabertos.bcb.gov.br`
- Alpha Vantage — `https://www.alphavantage.co/documentation`
- CoinGecko — `https://www.coingecko.com/api/documentation`
- Brapi — `https://brapi.dev/docs`
