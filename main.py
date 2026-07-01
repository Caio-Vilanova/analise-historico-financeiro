from src.finanalise.benchmark import benchmark


def main():

    pasta = "datasets/kaggle/dados"

    for processos in [2, 4, 8, 12]:

        resultado = benchmark(
            pasta,
            processos
        )

        print()
        print(
            f"===== RESULTADO DE {processos} PROCESSOS ====="
        )

        print(
            f"Linhas processadas: {resultado['linhas']}"
        )

        print(
            f"Tempo Serial: {resultado['tempo_serial']:.2f}s"
        )

        print(
            f"Tempo Paralelo: {resultado['tempo_paralelo']:.2f}s"
        )

        print(
            f"Speedup: {resultado['speedup']:.2f}x"
        )

        print(
            f"Núcleos Disponíveis: {resultado['nucleos']}"
        )

        print(
            f"CPU Média: {resultado['cpu_media']}%"
        )

        print(
            f"CPU Máxima: {resultado['cpu_maxima']}%"
        )

        print(
            f"RAM Utilizada: "
            f"{resultado['ram_gb']} GB "
            f"({resultado['ram_percent']}%)"
        )


if __name__ == "__main__":
    main()
