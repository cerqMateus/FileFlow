import os


def remove_file(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass
