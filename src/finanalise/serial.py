import os
import time
import pandas as pd


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


def executar_serial(pasta):

    inicio = time.perf_counter()

    total_linhas = 0

    for raiz, _, arquivos in os.walk(pasta):

        for arquivo in arquivos:

            if arquivo.endswith(".txt"):

                caminho = os.path.join(raiz, arquivo)

                total_linhas += processar_arquivo(caminho)

    tempo = time.perf_counter() - inicio

    return total_linhas, tempo
