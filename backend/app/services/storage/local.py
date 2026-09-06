import os
from .base import StorageService
from app.core.config import settings

class LocalStorageService(StorageService):
    def __init__(self):
        self.storage_path = settings.STORAGE_PATH
        os.makedirs(self.storage_path, exist_ok=True)

    def save(self, file_content: bytes, filename: str) -> str:
        # Just use the filename as storage_key for local storage for now, assuming UUID uniqueness from the API layer
        storage_key = filename
        full_path = os.path.join(self.storage_path, storage_key)
        with open(full_path, "wb") as f:
            f.write(file_content)
        return storage_key

    def get(self, storage_key: str) -> bytes:
        full_path = os.path.join(self.storage_path, storage_key)
        with open(full_path, "rb") as f:
            return f.read()

    def delete(self, storage_key: str) -> bool:
        full_path = os.path.join(self.storage_path, storage_key)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False

    def exists(self, storage_key: str) -> bool:
        full_path = os.path.join(self.storage_path, storage_key)
        return os.path.exists(full_path)
