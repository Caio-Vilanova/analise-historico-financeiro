import psutil
import threading
import time

cpu_usos = []
monitorando = False


def monitorar_cpu():
    global cpu_usos

    while monitorando:
        cpu_usos.append(psutil.cpu_percent(interval=0.5))
        time.sleep(0.5)


def iniciar_monitoramento():
    global monitorando
    global cpu_usos

    cpu_usos = []
    monitorando = True

    thread = threading.Thread(target=monitorar_cpu)
    thread.daemon = True
    thread.start()

    return thread


def parar_monitoramento():
    global monitorando

    monitorando = False

    if not cpu_usos:
        return 0, 0

    return (
        round(sum(cpu_usos) / len(cpu_usos), 2),
        round(max(cpu_usos), 2)
    )
