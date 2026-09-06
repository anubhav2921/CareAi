from abc import ABC, abstractmethod

class StorageService(ABC):
    @abstractmethod
    def save(self, file_content: bytes, filename: str) -> str:
        pass

    @abstractmethod
    def get(self, storage_key: str) -> bytes:
        pass

    @abstractmethod
    def delete(self, storage_key: str) -> bool:
        pass

    @abstractmethod
    def exists(self, storage_key: str) -> bool:
        pass
