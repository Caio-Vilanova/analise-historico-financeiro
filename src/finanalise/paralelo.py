import os
import time
import pandas as pd
from multiprocessing import Pool


def processar_arquivo(caminho):

    try:
        df = pd.read_csv(caminho)

        # Realiza várias operações para aumentar a carga computacional
        for _ in range(10):
            df["Close"].mean()
            df["Close"].std()
            df["Close"].max()
            df["Close"].min()
            df["Volume"].sum()

        return len(df)

    except Exception:
        return 0


def executar_paralelo(pasta, processos=12):

    arquivos = []

    for raiz, _, nomes_arquivos in os.walk(pasta):

        for arquivo in nomes_arquivos:

            if arquivo.endswith(".txt"):
                arquivos.append(
                    os.path.join(raiz, arquivo)
                )

    inicio = time.perf_counter()

    with Pool(processes=processos) as pool:
        resultados = pool.map(
            processar_arquivo,
            arquivos
        )

    total_linhas = sum(resultados)

    tempo = time.perf_counter() - inicio

    return total_linhas, tempo
