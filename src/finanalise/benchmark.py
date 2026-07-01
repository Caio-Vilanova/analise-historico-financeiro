import psutil

from src.finanalise.serial import executar_serial
from src.finanalise.paralelo import executar_paralelo
from src.finanalise.cpu_monitor import (
    iniciar_monitoramento,
    parar_monitoramento
)


def benchmark(pasta, processos):

    # Inicia monitoramento da CPU
    iniciar_monitoramento()

    # Execução serial
    linhas_serial, tempo_serial = executar_serial(pasta)

    # Execução paralela
    linhas_paralelo, tempo_paralelo = executar_paralelo(
        pasta,
        processos
    )

    # Para monitoramento
    cpu_media, cpu_maxima = parar_monitoramento()

    # Calcula speedup
    speedup = tempo_serial / tempo_paralelo

    return {
        "linhas": linhas_paralelo,
        "tempo_serial": tempo_serial,
        "tempo_paralelo": tempo_paralelo,
        "speedup": speedup,
        "cpu_media": cpu_media,
        "cpu_maxima": cpu_maxima,
        "ram_gb": round(
            psutil.virtual_memory().used / (1024**3),
            2
        ),
        "ram_percent": psutil.virtual_memory().percent,
        "nucleos": psutil.cpu_count()
    }
